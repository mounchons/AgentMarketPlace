"""
Position Sizing for Meta-Labeling
Maps ML confidence to position size using risk management principles.

References:
- Kelly Criterion (J.L. Kelly, 1956)
- Lopez de Prado (2018), Chapter 10: Bet Sizing
"""

import numpy as np
from dataclasses import dataclass
from typing import Optional


@dataclass
class PositionSize:
    """Result of position sizing calculation."""
    lot_size: float
    risk_pct: float
    risk_amount: float
    sl_distance: float
    confidence: float
    reason: str


class PositionSizer:
    """
    Position sizing based on meta-label confidence.
    
    Three approaches available:
    1. Tiered: Fixed risk tiers based on confidence thresholds
    2. Linear: Risk scales linearly with confidence
    3. Kelly: Optimal sizing based on Kelly criterion
    """
    
    def __init__(
        self,
        max_risk_pct: float = 0.015,
        min_risk_pct: float = 0.003,
        min_confidence: float = 0.60,
        max_daily_risk_pct: float = 0.03,
        max_concurrent: int = 2,
        method: str = 'tiered'  # 'tiered', 'linear', or 'kelly'
    ):
        self.max_risk = max_risk_pct
        self.min_risk = min_risk_pct
        self.min_conf = min_confidence
        self.max_daily_risk = max_daily_risk_pct
        self.max_concurrent = max_concurrent
        self.method = method
        
        # Track daily state
        self._daily_pnl = 0.0
        self._open_positions = 0
        self._trades_today = 0
        self._max_trades_per_day = 6
    
    def calculate(
        self,
        confidence: float,
        atr: float,
        sl_atr_mult: float,
        account_balance: float,
        pip_value: float = 1.0,
        avg_win: Optional[float] = None,
        avg_loss: Optional[float] = None
    ) -> PositionSize:
        """
        Calculate position size based on confidence and risk parameters.
        
        Args:
            confidence: ML meta-label probability (0-1)
            atr: ATR of entry timeframe (M15)
            sl_atr_mult: Stop-loss in ATR multiples
            account_balance: Current account balance
            pip_value: Value per pip per lot
            avg_win: Average win amount (for Kelly)
            avg_loss: Average loss amount (for Kelly)
        
        Returns:
            PositionSize with calculated values
        """
        # Safety checks
        if confidence < self.min_conf:
            return PositionSize(0, 0, 0, 0, confidence, 'SKIP: below min confidence')
        
        if self._open_positions >= self.max_concurrent:
            return PositionSize(0, 0, 0, 0, confidence, 'SKIP: max concurrent reached')
        
        if self._trades_today >= self._max_trades_per_day:
            return PositionSize(0, 0, 0, 0, confidence, 'SKIP: max daily trades reached')
        
        daily_loss_pct = abs(self._daily_pnl) / account_balance if self._daily_pnl < 0 else 0
        if daily_loss_pct >= self.max_daily_risk:
            return PositionSize(0, 0, 0, 0, confidence, 'SKIP: daily loss limit reached')
        
        # Calculate risk percentage
        if self.method == 'tiered':
            risk_pct = self._tiered_risk(confidence)
        elif self.method == 'linear':
            risk_pct = self._linear_risk(confidence)
        elif self.method == 'kelly':
            risk_pct = self._kelly_risk(confidence, avg_win, avg_loss)
        else:
            risk_pct = self._tiered_risk(confidence)
        
        # Cap remaining daily risk
        remaining_risk = self.max_daily_risk - daily_loss_pct
        risk_pct = min(risk_pct, remaining_risk)
        
        # Calculate lot size
        risk_amount = account_balance * risk_pct
        sl_distance = atr * sl_atr_mult
        
        if sl_distance <= 0:
            return PositionSize(0, 0, 0, 0, confidence, 'SKIP: invalid SL distance')
        
        lot_size = risk_amount / (sl_distance * pip_value)
        
        return PositionSize(
            lot_size=round(lot_size, 2),
            risk_pct=risk_pct,
            risk_amount=round(risk_amount, 2),
            sl_distance=round(sl_distance, 2),
            confidence=confidence,
            reason=f'TRADE: {self.method} sizing at {risk_pct:.1%} risk'
        )
    
    def _tiered_risk(self, confidence: float) -> float:
        """Fixed tiers: simple and robust."""
        if confidence >= 0.80:
            return 0.015  # 1.5%
        elif confidence >= 0.70:
            return 0.010  # 1.0%
        elif confidence >= 0.60:
            return 0.005  # 0.5%
        return 0
    
    def _linear_risk(self, confidence: float) -> float:
        """Risk scales linearly between min and max confidence."""
        if confidence < self.min_conf:
            return 0
        # Scale from min_risk at min_conf to max_risk at 1.0
        scale = (confidence - self.min_conf) / (1.0 - self.min_conf)
        return self.min_risk + scale * (self.max_risk - self.min_risk)
    
    def _kelly_risk(
        self,
        confidence: float,
        avg_win: Optional[float],
        avg_loss: Optional[float]
    ) -> float:
        """
        Kelly Criterion: f* = (p × b - q) / b
        where p=win_rate, q=loss_rate, b=avg_win/avg_loss
        
        Use half-Kelly for safety (full Kelly is too aggressive).
        """
        if avg_win is None or avg_loss is None or avg_loss == 0:
            return self._tiered_risk(confidence)  # fallback
        
        p = confidence  # use ML probability as win rate estimate
        q = 1 - p
        b = avg_win / abs(avg_loss)  # odds ratio
        
        kelly = (p * b - q) / b
        half_kelly = kelly / 2.0  # half-Kelly for safety
        
        # Clamp to reasonable range
        return max(self.min_risk, min(self.max_risk, half_kelly))
    
    def update_daily(self, pnl: float):
        """Update daily tracking after a trade closes."""
        self._daily_pnl += pnl
        self._trades_today += 1
    
    def open_position(self):
        """Track new position opened."""
        self._open_positions += 1
    
    def close_position(self):
        """Track position closed."""
        self._open_positions = max(0, self._open_positions - 1)
    
    def reset_daily(self):
        """Reset at start of new trading day."""
        self._daily_pnl = 0.0
        self._trades_today = 0
        self._open_positions = 0
