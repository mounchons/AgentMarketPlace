---
name: meta-labeling
description: Implement Meta-Labeling architecture for trading ML systems, based on Marcos Lopez de Prado's methodology. Use when building two-layer trading systems where a primary model generates signals and a secondary ML model filters them, implementing position sizing based on ML confidence, separating trade direction (side) from trade sizing decisions, or improving precision of trading signals without sacrificing recall. Triggers on mentions of meta-labeling, meta labeling, signal filtering, trade sizing by confidence, primary/secondary model architecture, or two-layer trading systems.
---

# Meta-Labeling Skill

Implementation guide for Meta-Labeling in financial ML, based on:
- Lopez de Prado, M. (2018) "Advances in Financial Machine Learning", Chapter 3
- Lopez de Prado & Foreman (2014) "Meta-Strategies"
- Hudson & Thames research on meta-labeling efficacy

## What is Meta-Labeling?

Meta-labeling separates two decisions that are usually (incorrectly) combined:
1. **Side** — should I go long or short? (Primary Model)
2. **Size** — should I trade at all, and how much? (Secondary ML Model)

```
Traditional (bad):
  ML Model → BUY / SELL / SKIP  (one model does everything → overfit prone)

Meta-Labeling (good):
  Primary Model → BUY or SELL    (rule-based, high recall, interpretable)
  Secondary ML  → TRADE or SKIP  (binary classification, easier task)
                  + confidence → position size
```

## Why Meta-Labeling Works Better

From Lopez de Prado:

> "ML algorithms are often criticized as black boxes. Meta-labeling allows you
> to build an ML system on top of a white box. The effects of overfitting are
> limited because ML will not decide the side of your bet, only the size."

Key benefits:
1. **Reduces overfitting** — ML only decides size, not direction
2. **Interpretable** — Primary model is rule-based (explainable)
3. **Higher F1 score** — Start with high-recall primary, ML improves precision
4. **Flexible sizing** — Confidence → position size (Kelly-like)
5. **Regime adaptable** — ML learns which market conditions favor the strategy

## Architecture

```
┌─────────────────────────────────────────────┐
│  Layer 1: Primary Strategy (Rule-Based)     │
│                                             │
│  H4 Regime → H1 Direction → M15 Entry      │
│  Output: BUY or SELL signal (high recall)   │
└──────────────────┬──────────────────────────┘
                   │ Raw signals
                   ▼
┌─────────────────────────────────────────────┐
│  Feature Engineering                         │
│  Extract ~65 features at signal time         │
│  (technical, session, regime, micro)         │
└──────────────────┬──────────────────────────┘
                   │ Feature vector
                   ▼
┌─────────────────────────────────────────────┐
│  Layer 2: ML Meta-Label (Ensemble)          │
│                                             │
│  XGBoost + LightGBM + Random Forest         │
│  Binary: 1=profitable, 0=unprofitable       │
│  Output: probability → confidence score      │
└──────────────────┬──────────────────────────┘
                   │ confidence
                   ▼
┌─────────────────────────────────────────────┐
│  Position Sizing                             │
│  confidence ≥ 0.80 → risk 1.5%             │
│  confidence ≥ 0.70 → risk 1.0%             │
│  confidence ≥ 0.60 → risk 0.5%             │
│  confidence <  0.60 → SKIP (no trade)       │
└─────────────────────────────────────────────┘
```

## Implementation Guide

### Step 1: Build Primary Strategy (High Recall)

The primary model should catch MOST real opportunities, even at the cost of false positives.

```python
class PrimaryStrategy:
    """
    Rule-based signal generator.
    Goal: HIGH RECALL (catch most real setups).
    Precision can be low — ML will fix it.
    """
    
    def generate_signal(self, h4_data, h1_data, m15_data):
        """
        Returns: 'BUY', 'SELL', or None
        """
        regime = self.detect_regime(h4_data)
        if regime == 'VOLATILE':
            return None
        
        direction = self.get_direction(h1_data)
        if direction == 'NEUTRAL':
            return None
        
        entry = self.check_entry(m15_data, regime, direction)
        return entry  # 'BUY', 'SELL', or None
    
    def check_entry(self, m15_data, regime, direction):
        """
        M15 Entry triggers — deliberately generous (high recall).
        Require only 2 of 5 triggers.
        """
        triggers = [
            self.is_pullback_to_ema(m15_data),
            self.is_rsi_extreme(m15_data),
            self.is_at_sr_level(m15_data),
            self.has_reversal_candle(m15_data),
            self.is_macd_shifting(m15_data),
        ]
        
        if sum(triggers) >= 2:
            if regime == 'RANGE':
                return self._range_signal(m15_data)
            return 'BUY' if direction == 'BULLISH' else 'SELL'
        return None
```

### Step 2: Create Meta-Labels (Training Targets)

Label each raw signal: would it have been profitable (including costs)?

```python
def create_meta_labels(df, signals_df, costs):
    """
    For each signal from primary strategy:
    - Simulate the trade with Triple-Barrier
    - Include transaction costs
    - Label: 1=profitable, 0=unprofitable, -1=exclude
    
    Args:
        df: M15 OHLCV DataFrame
        signals_df: DataFrame with signal_time, direction columns
        costs: TransactionCosts instance
    
    Returns:
        DataFrame with meta-labels
    """
    labels = []
    
    for _, signal in signals_df.iterrows():
        idx = df.index.get_loc(signal['signal_time'])
        atr = calc_atr(df, 14, idx)
        total_cost = costs.total_cost(atr, signal.get('session', 'LONDON'))
        
        label = triple_barrier_label(
            df=df,
            index=idx,
            direction=signal['direction'],
            tp_atr_mult=2.0,
            sl_atr_mult=1.0,
            max_hold_bars=24,  # 6 hours for M15
            spread=total_cost * 0.7,  # ~70% of cost is spread
            slippage_atr_pct=0.05
        )
        
        labels.append({
            'signal_time': signal['signal_time'],
            'direction': signal['direction'],
            'meta_label': label,  # 1, 0, or -1
        })
    
    result = pd.DataFrame(labels)
    # Exclude timeouts (-1) from training
    return result[result['meta_label'] >= 0]
```

### Step 3: Train ML Meta-Label Model

```python
class MetaLabelModel:
    """
    Secondary ML model for meta-labeling.
    Binary classification: 1=trade, 0=skip.
    Uses probability for position sizing.
    """
    
    def __init__(self):
        self.models = {
            'xgboost': XGBClassifier(**XGB_PARAMS),
            'lightgbm': LGBMClassifier(**LGBM_PARAMS),
            'random_forest': RandomForestClassifier(
                n_estimators=500, max_depth=5,
                min_samples_leaf=30, n_jobs=-1
            ),
        }
        self.weights = {'xgboost': 0.4, 'lightgbm': 0.4, 'random_forest': 0.2}
    
    def fit(self, X, y, sample_weight=None):
        """
        Train all models in ensemble.
        
        Args:
            X: Feature DataFrame
            y: Meta-labels (0 or 1)
            sample_weight: Adaptive weights (time decay × regime match)
        """
        for name, model in self.models.items():
            if hasattr(model, 'sample_weight'):
                model.fit(X, y, sample_weight=sample_weight)
            else:
                model.fit(X, y)
    
    def predict_proba(self, X):
        """
        Weighted ensemble probability.
        Returns probability of class 1 (profitable).
        """
        probas = {}
        for name, model in self.models.items():
            probas[name] = model.predict_proba(X)[:, 1]
        
        ensemble_proba = sum(
            probas[name] * self.weights[name]
            for name in self.models
        )
        return ensemble_proba
    
    def predict_with_sizing(self, X, atr, account_balance):
        """
        Full prediction: trade/skip + direction + position size.
        
        Returns list of dicts with:
            action: 'TRADE' or 'SKIP'
            confidence: float 0-1
            position_size: float (lot size)
            risk_pct: float (risk as % of account)
        """
        probas = self.predict_proba(X)
        results = []
        
        for i, proba in enumerate(probas):
            if proba >= 0.80:
                risk_pct = 0.015
            elif proba >= 0.70:
                risk_pct = 0.010
            elif proba >= 0.60:
                risk_pct = 0.005
            else:
                results.append({
                    'action': 'SKIP',
                    'confidence': float(proba),
                    'position_size': 0,
                    'risk_pct': 0
                })
                continue
            
            risk_amount = account_balance * risk_pct
            sl_distance = atr[i] if hasattr(atr, '__len__') else atr
            pip_value = 1.0  # adjust for broker
            lot_size = risk_amount / (sl_distance * pip_value)
            
            results.append({
                'action': 'TRADE',
                'confidence': float(proba),
                'position_size': round(lot_size, 2),
                'risk_pct': risk_pct
            })
        
        return results
```

### Step 4: Evaluate Meta-Label Performance

```python
def evaluate_meta_label(primary_signals, meta_predictions, actual_outcomes):
    """
    Evaluate meta-labeling effectiveness.
    
    Key question: Did ML improve the primary strategy?
    
    Compare:
    1. Primary only (trade ALL signals) → baseline
    2. Primary + Meta-Label (trade filtered signals) → should be better
    """
    # Baseline: trade everything
    baseline_expectancy = calc_expectancy(actual_outcomes)
    baseline_trades = len(actual_outcomes)
    
    # With meta-label filter
    traded = meta_predictions[meta_predictions['action'] == 'TRADE']
    traded_outcomes = actual_outcomes.loc[traded.index]
    filtered_expectancy = calc_expectancy(traded_outcomes)
    filtered_trades = len(traded_outcomes)
    
    # Skipped signals
    skipped = meta_predictions[meta_predictions['action'] == 'SKIP']
    skipped_outcomes = actual_outcomes.loc[skipped.index]
    skipped_expectancy = calc_expectancy(skipped_outcomes)
    
    report = {
        'baseline': {
            'expectancy': baseline_expectancy,
            'trades': baseline_trades,
        },
        'filtered': {
            'expectancy': filtered_expectancy,
            'trades': filtered_trades,
        },
        'skipped': {
            'expectancy': skipped_expectancy,
            'trades': len(skipped_outcomes),
        },
        'improvement': {
            'expectancy_lift': filtered_expectancy - baseline_expectancy,
            'trades_reduced_pct': 1 - (filtered_trades / baseline_trades),
            'ml_correctly_skipped_losers': (
                skipped_outcomes[skipped_outcomes < 0].sum()
                if len(skipped_outcomes) > 0 else 0
            ),
        }
    }
    
    return report
```

## Key Insights from Research

### What makes Meta-Labeling effective:

1. **Precision-Recall trade-off**: Primary model has high recall (catches most setups).
   ML meta-label improves precision (filters out bad setups). Together → higher F1.

2. **Feature importance differs by side**: Features that predict rallies differ from
   features that predict sell-offs. Meta-labeling naturally handles this because
   BUY and SELL signals can be filtered by different learned patterns.

3. **Bet sizing from probability**: The confidence score from ML is not just trade/skip.
   It's a continuous measure → Kelly criterion or similar for optimal position sizing.

4. **Regime adaptability**: ML learns that the primary strategy works better in certain
   conditions. During unfavorable conditions, ML confidence drops → smaller/no trades.

### Common mistakes with Meta-Labeling:

| Mistake | Fix |
|---------|-----|
| Primary model too restrictive (low recall) | Loosen triggers — ML will handle precision |
| Training meta-label on features primary already uses | Add NEW features (session, micro-structure, cross-TF) |
| Using meta-label probability as raw accuracy | Calibrate probabilities before sizing |
| Not including transaction costs in labels | Always simulate with realistic costs |
| Meta-label trained on different data than primary | Both must use identical data pipeline |

## Reference Implementation

For a complete Python implementation with sample weighting, see `scripts/meta_label_pipeline.py`.
For the position sizing module, see `scripts/position_sizing.py`.
