"""
Meta-Label Pipeline
Complete implementation for two-layer trading system.

Layer 1: Rule-based signal generation (Primary)
Layer 2: ML meta-labeling for signal filtering and sizing (Secondary)

Based on: Lopez de Prado (2018), "Advances in Financial Machine Learning"
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Optional, List, Dict, Tuple
from enum import Enum


class Regime(Enum):
    TREND_UP = "TREND_UP"
    TREND_DOWN = "TREND_DOWN"
    RANGE = "RANGE"
    VOLATILE = "VOLATILE"


class Direction(Enum):
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    NEUTRAL = "NEUTRAL"


@dataclass
class RawSignal:
    """Output from Layer 1 (Primary Strategy)."""
    timestamp: pd.Timestamp
    direction: str  # 'BUY' or 'SELL'
    regime: str
    h1_direction: str
    triggers_hit: List[str]
    entry_price: float
    atr_m15: float
    session: str


@dataclass
class MetaDecision:
    """Output from Layer 2 (ML Meta-Label)."""
    signal: RawSignal
    action: str  # 'TRADE' or 'SKIP'
    confidence: float
    position_size: float
    risk_pct: float
    tp_price: float
    sl_price: float


class MetaLabelPipeline:
    """
    Complete Meta-Labeling pipeline.
    
    Usage:
        pipeline = MetaLabelPipeline(primary_strategy, meta_model, feature_engine)
        
        # Training
        pipeline.train(m5_data, m15_data, h1_data, h4_data)
        
        # Prediction
        decision = pipeline.predict(m5_data, m15_data, h1_data, h4_data)
    """
    
    def __init__(self, primary_strategy, meta_model, feature_engine,
                 tp_atr_mult: float = 2.0,
                 sl_atr_mult: float = 1.0,
                 max_hold_bars: int = 24,
                 base_spread_pts: float = 25.0,
                 slippage_atr_pct: float = 0.05):
        """
        Args:
            primary_strategy: Layer 1 rule-based strategy
            meta_model: Layer 2 ML ensemble model
            feature_engine: Feature extraction engine
            tp_atr_mult: Take-profit in ATR multiples
            sl_atr_mult: Stop-loss in ATR multiples
            max_hold_bars: Maximum hold time in M15 bars
            base_spread_pts: Average spread in points
            slippage_atr_pct: Slippage as fraction of ATR
        """
        self.primary = primary_strategy
        self.meta_model = meta_model
        self.features = feature_engine
        self.tp_mult = tp_atr_mult
        self.sl_mult = sl_atr_mult
        self.max_hold = max_hold_bars
        self.spread = base_spread_pts
        self.slippage = slippage_atr_pct
    
    def generate_training_data(
        self,
        m5_df: pd.DataFrame,
        m15_df: pd.DataFrame,
        h1_df: pd.DataFrame,
        h4_df: pd.DataFrame,
        d1_df: Optional[pd.DataFrame] = None
    ) -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
        """
        Generate training data for meta-label model.
        
        1. Run primary strategy on historical data → raw signals
        2. For each signal, extract features
        3. For each signal, create meta-label (profitable or not)
        
        Returns:
            X: Features DataFrame
            y: Meta-labels (0 or 1)
            sample_weights: Adaptive weights
        """
        signals = []
        feature_rows = []
        labels = []
        
        # Walk through M15 bars
        warmup = 200  # skip first bars for indicator warmup
        
        for i in range(warmup, len(m15_df)):
            # Layer 1: Check for signal
            signal = self.primary.generate_signal(
                h4_df, h1_df, m15_df, index=i
            )
            
            if signal is None:
                continue
            
            # Extract features at signal time
            feat = self.features.extract(
                m5_df, m15_df, h1_df, h4_df, d1_df, m15_index=i
            )
            
            if feat is None:  # NaN in features
                continue
            
            # Create meta-label
            label = self._create_meta_label(m15_df, i, signal.direction)
            
            if label == -1:  # exclude timeout
                continue
            
            signals.append(signal)
            feature_rows.append(feat)
            labels.append(label)
        
        X = pd.DataFrame(feature_rows)
        y = pd.Series(labels, name='meta_label')
        
        # Calculate sample weights
        dates = pd.Series([s.timestamp for s in signals])
        regimes = pd.Series([s.regime for s in signals])
        weights = self._calc_weights(dates, regimes)
        
        return X, y, weights
    
    def _create_meta_label(
        self,
        df: pd.DataFrame,
        index: int,
        direction: str
    ) -> int:
        """
        Triple-Barrier meta-label WITH transaction costs.
        
        Returns: 1=WIN, 0=LOSS, -1=EXCLUDE (timeout small P&L)
        """
        atr = self._calc_atr(df, 14, index)
        entry = df['close'].iloc[index]
        
        # Transaction costs
        spread_cost = self.spread * 0.01 * 0.5  # half spread at entry
        slippage_cost = atr * self.slippage
        entry_cost = spread_cost + slippage_cost
        exit_cost = entry_cost  # same at exit
        
        if direction == 'BUY':
            effective_entry = entry + entry_cost
            tp = effective_entry + (atr * self.tp_mult)
            sl = effective_entry - (atr * self.sl_mult)
        else:
            effective_entry = entry - entry_cost
            tp = effective_entry - (atr * self.tp_mult)
            sl = effective_entry + (atr * self.sl_mult)
        
        # Check day-end boundary
        end_bar = min(index + self.max_hold, len(df))
        day_close = self._find_day_close(df, index)
        if day_close:
            end_bar = min(end_bar, day_close)
        
        # Walk forward
        for i in range(index + 1, end_bar):
            h = df['high'].iloc[i]
            l = df['low'].iloc[i]
            
            if direction == 'BUY':
                if h >= tp:
                    return 1  # WIN
                if l <= sl:
                    return 0  # LOSS
            else:
                if l <= tp:
                    return 1  # WIN
                if h >= sl:
                    return 0  # LOSS
        
        # Timeout — check final P&L
        if end_bar > index + 1:
            exit_price = df['close'].iloc[end_bar - 1]
            if direction == 'BUY':
                pnl = exit_price - effective_entry - exit_cost
            else:
                pnl = effective_entry - exit_price - exit_cost
            
            if abs(pnl) < atr * 0.2:
                return -1  # too small, exclude
            return 1 if pnl > 0 else 0
        
        return -1
    
    def _calc_weights(
        self,
        dates: pd.Series,
        regimes: pd.Series,
        half_life_days: int = 180
    ) -> np.ndarray:
        """Adaptive sample weighting: time decay × regime matching."""
        latest = dates.max()
        current_regime = regimes.iloc[-1]
        
        weights = np.zeros(len(dates))
        for i in range(len(dates)):
            days_ago = (latest - dates.iloc[i]).days
            time_w = 2.0 ** (-days_ago / half_life_days)
            regime_w = 1.0 if regimes.iloc[i] == current_regime else 0.3
            weights[i] = time_w * regime_w
        
        # Normalize
        if weights.mean() > 0:
            weights /= weights.mean()
        return weights
    
    def predict(
        self,
        m5_df: pd.DataFrame,
        m15_df: pd.DataFrame,
        h1_df: pd.DataFrame,
        h4_df: pd.DataFrame,
        d1_df: Optional[pd.DataFrame] = None,
        account_balance: float = 10000.0
    ) -> Optional[MetaDecision]:
        """
        Full pipeline prediction on latest bar.
        
        Returns MetaDecision or None.
        """
        i = len(m15_df) - 1
        
        # Layer 1
        signal = self.primary.generate_signal(h4_df, h1_df, m15_df, index=i)
        if signal is None:
            return None
        
        # Features
        feat = self.features.extract(
            m5_df, m15_df, h1_df, h4_df, d1_df, m15_index=i
        )
        if feat is None:
            return None
        
        X = pd.DataFrame([feat])
        
        # Layer 2
        proba = self.meta_model.predict_proba(X)[0]
        
        # Position sizing
        if proba >= 0.80:
            risk_pct = 0.015
        elif proba >= 0.70:
            risk_pct = 0.010
        elif proba >= 0.60:
            risk_pct = 0.005
        else:
            return MetaDecision(
                signal=signal, action='SKIP', confidence=proba,
                position_size=0, risk_pct=0, tp_price=0, sl_price=0
            )
        
        # Calculate TP/SL
        atr = signal.atr_m15
        if signal.direction == 'BUY':
            tp = signal.entry_price + (atr * self.tp_mult)
            sl = signal.entry_price - (atr * self.sl_mult)
        else:
            tp = signal.entry_price - (atr * self.tp_mult)
            sl = signal.entry_price + (atr * self.sl_mult)
        
        risk_amount = account_balance * risk_pct
        lot_size = risk_amount / (atr * self.sl_mult)
        
        return MetaDecision(
            signal=signal,
            action='TRADE',
            confidence=proba,
            position_size=round(lot_size, 2),
            risk_pct=risk_pct,
            tp_price=round(tp, 2),
            sl_price=round(sl, 2)
        )
    
    @staticmethod
    def _calc_atr(df: pd.DataFrame, period: int, index: int) -> float:
        """Average True Range calculation."""
        if index < period:
            return 0.0
        
        tr_values = []
        for i in range(index - period + 1, index + 1):
            h = df['high'].iloc[i]
            l = df['low'].iloc[i]
            pc = df['close'].iloc[i - 1]
            tr = max(h - l, abs(h - pc), abs(l - pc))
            tr_values.append(tr)
        
        return np.mean(tr_values)
    
    @staticmethod
    def _find_day_close(df: pd.DataFrame, index: int) -> Optional[int]:
        """Find the bar index where trading day ends (20:30 UTC)."""
        signal_date = df.index[index].date() if hasattr(df.index, 'date') else None
        if signal_date is None:
            return None
        
        for i in range(index + 1, min(index + 100, len(df))):
            bar_time = df.index[i]
            if hasattr(bar_time, 'hour') and bar_time.hour >= 21:
                return i
            if hasattr(bar_time, 'date') and bar_time.date() > signal_date:
                return i
        
        return None
