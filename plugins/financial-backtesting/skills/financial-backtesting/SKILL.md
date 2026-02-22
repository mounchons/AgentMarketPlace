---
name: financial-backtesting
description: Apply rigorous financial backtesting best practices based on Marcos Lopez de Prado's methodology. Use when backtesting trading strategies, validating ML models on financial time series, implementing cross-validation for trading systems, calculating trading performance metrics (expectancy, profit factor, Sharpe ratio, drawdown), detecting overfitting in financial ML, or implementing walk-forward validation. Triggers on mentions of backtest, walk-forward, purged k-fold, overfitting detection, trading performance metrics, or financial cross-validation.
---

# Financial Backtesting Skill

Best practices for backtesting ML-based trading strategies, based on methodologies from
"Advances in Financial Machine Learning" (Marcos Lopez de Prado, 2018) and modern quantitative finance research.

## Core Principle

> A backtest is NOT a research tool. Feature importance is.
> — Marcos Lopez de Prado

Backtests are easily overfitted. Treat them as a final sanity check, not as an optimization target.

## 1. Triple-Barrier Labeling

The standard method for creating labels in financial ML. Instead of fixed-horizon returns, use three barriers:

```python
def triple_barrier_label(df, index, direction, tp_atr_mult, sl_atr_mult,
                          max_hold_bars, spread=0, slippage_atr_pct=0):
    """
    Triple-Barrier Method (Lopez de Prado, Ch.3)
    
    Barriers:
      Upper: Take-Profit = entry + tp_atr_mult × ATR
      Lower: Stop-Loss   = entry - sl_atr_mult × ATR
      Vertical: Time     = max_hold_bars
      
    CRITICAL: Include transaction costs in barrier calculation.
    
    Args:
        df: OHLCV DataFrame
        index: signal bar index
        direction: 'BUY' or 'SELL'
        tp_atr_mult: TP in ATR multiples (e.g. 2.0)
        sl_atr_mult: SL in ATR multiples (e.g. 1.0)
        max_hold_bars: vertical barrier (e.g. 24 for M15 = 6hrs)
        spread: spread in price units
        slippage_atr_pct: slippage as fraction of ATR
    
    Returns:
        1 = TP hit first (WIN)
        0 = SL hit first (LOSS)
       -1 = Vertical barrier hit (TIMEOUT — may exclude from training)
    """
    atr = calc_atr(df, 14, index)
    entry = df['close'].iloc[index]
    
    # Transaction costs
    cost = (spread * 0.5) + (atr * slippage_atr_pct)
    
    if direction == 'BUY':
        effective_entry = entry + cost
        tp = effective_entry + (atr * tp_atr_mult)
        sl = effective_entry - (atr * sl_atr_mult)
    else:
        effective_entry = entry - cost
        tp = effective_entry - (atr * tp_atr_mult)
        sl = effective_entry + (atr * sl_atr_mult)
    
    end = min(index + max_hold_bars, len(df))
    
    for i in range(index + 1, end):
        h, l = df['high'].iloc[i], df['low'].iloc[i]
        if direction == 'BUY':
            if h >= tp: return 1
            if l <= sl: return 0
        else:
            if l <= tp: return 1
            if h >= sl: return 0
    
    # Vertical barrier — calculate exit P&L
    exit_price = df['close'].iloc[end - 1]
    exit_cost = cost  # exit side cost
    if direction == 'BUY':
        pnl = exit_price - effective_entry - exit_cost
    else:
        pnl = effective_entry - exit_price - exit_cost
    
    return 1 if pnl > 0 else (0 if pnl < 0 else -1)
```

## 2. Purged K-Fold Cross-Validation

Standard k-fold WILL leak future data in financial time series. Always use purging + embargo.

```python
def purged_kfold_split(n_samples, n_splits=5, embargo_pct=0.02,
                        max_label_horizon=24):
    """
    Purged K-Fold (Lopez de Prado, Ch.7)
    
    Problems with standard k-fold on time series:
    1. Non-IID: financial data has temporal dependence
    2. Label leakage: labels depend on future bars
    3. Serial correlation: nearby bars are correlated
    
    Solution:
    - Purge: remove training samples whose label period overlaps test set
    - Embargo: add gap after test set before next training fold
    
    Args:
        n_samples: total number of samples
        n_splits: number of folds
        embargo_pct: fraction of samples to embargo (0.02 = 2%)
        max_label_horizon: max bars used to determine label
    
    Yields:
        (train_indices, test_indices) for each fold
    """
    fold_size = n_samples // n_splits
    embargo_size = max(1, int(n_samples * embargo_pct))
    
    for i in range(n_splits):
        test_start = i * fold_size
        test_end = min((i + 1) * fold_size, n_samples)
        
        # Purge: remove samples within label_horizon of test boundaries
        purge_start = max(0, test_start - max_label_horizon)
        purge_end = min(n_samples, test_end + max_label_horizon)
        
        # Embargo: additional gap after test set
        embargo_end = min(n_samples, purge_end + embargo_size)
        
        # Training indices: everything except purged + embargoed region
        train_idx = list(range(0, purge_start)) + list(range(embargo_end, n_samples))
        test_idx = list(range(test_start, test_end))
        
        if len(train_idx) > 0 and len(test_idx) > 0:
            yield train_idx, test_idx
```

### Walk-Forward Validation (complementary)

```python
def walk_forward_split(n_samples, n_splits=5, min_train_pct=0.3,
                        embargo_bars=48):
    """
    Walk-Forward with embargo. More realistic than k-fold for deployment.
    Each fold: train on past → test on future (never reverse).
    
    Yields:
        (train_indices, test_indices) for each fold
    """
    test_size = n_samples // (n_splits + 1)
    min_train = int(n_samples * min_train_pct)
    
    for i in range(n_splits):
        test_start = min_train + (i * test_size) + embargo_bars
        test_end = test_start + test_size
        
        if test_end > n_samples:
            break
        
        train_end = test_start - embargo_bars
        train_idx = list(range(0, train_end))
        test_idx = list(range(test_start, test_end))
        
        yield train_idx, test_idx
```

## 3. Transaction Cost Modeling

ALWAYS model costs. A strategy that ignores costs is fiction.

```python
class TransactionCosts:
    """
    Gold (XAU/USD) typical costs:
    - Spread: 20-30 points (varies by session, broker, volatility)
    - Slippage: 3-10 points (depends on volume, speed)
    - Commission: usually included in spread for retail
    
    Dynamic spread model:
    - Asian session: spread × 1.3 (lower liquidity)
    - London/NY: spread × 1.0 (normal)
    - Overlap: spread × 0.9 (highest liquidity)
    - News events: spread × 2.0-5.0
    """
    
    def __init__(self, base_spread_pts=25, slippage_atr_pct=0.05,
                 commission_per_lot=0):
        self.base_spread = base_spread_pts
        self.slippage_pct = slippage_atr_pct
        self.commission = commission_per_lot
    
    def total_cost(self, atr, session='LONDON', is_news=False):
        """Total round-trip cost in price units."""
        spread_mult = {
            'ASIAN': 1.3, 'LONDON': 1.0,
            'NY': 1.0, 'OVERLAP': 0.9
        }.get(session, 1.0)
        
        if is_news:
            spread_mult *= 3.0
        
        spread_cost = self.base_spread * spread_mult * 0.01
        slippage = atr * self.slippage_pct * 2  # both entry and exit
        
        return spread_cost + slippage + self.commission
```

## 4. Performance Metrics

### Primary: Expectancy

```python
def expectancy(wins, losses, avg_win, avg_loss, cost_per_trade=0):
    """
    E = (win_rate × avg_win) - (loss_rate × avg_loss) - costs
    
    This is THE most important metric.
    Positive expectancy = profitable system (over enough trades).
    """
    total = wins + losses
    if total == 0:
        return 0
    win_rate = wins / total
    loss_rate = losses / total
    return (win_rate * avg_win) - (loss_rate * avg_loss) - cost_per_trade
```

### Full Metrics Suite

```python
def calculate_metrics(trades_df):
    """
    trades_df must have columns: pnl, is_win, entry_time, exit_time
    
    Returns dict with all key metrics.
    """
    wins = trades_df[trades_df['is_win'] == True]
    losses = trades_df[trades_df['is_win'] == False]
    
    metrics = {
        # Primary
        'expectancy': expectancy(
            len(wins), len(losses),
            wins['pnl'].mean() if len(wins) > 0 else 0,
            abs(losses['pnl'].mean()) if len(losses) > 0 else 0
        ),
        'profit_factor': (
            wins['pnl'].sum() / abs(losses['pnl'].sum())
            if len(losses) > 0 and losses['pnl'].sum() != 0
            else float('inf')
        ),
        
        # Risk
        'max_drawdown': calc_max_drawdown(trades_df['pnl'].cumsum()),
        'max_daily_drawdown': calc_max_daily_drawdown(trades_df),
        'sharpe_ratio': calc_sharpe(trades_df['pnl']),
        
        # Informational
        'total_trades': len(trades_df),
        'win_rate': len(wins) / len(trades_df) if len(trades_df) > 0 else 0,
        'avg_win': wins['pnl'].mean() if len(wins) > 0 else 0,
        'avg_loss': losses['pnl'].mean() if len(losses) > 0 else 0,
        'avg_rr': (
            abs(wins['pnl'].mean() / losses['pnl'].mean())
            if len(losses) > 0 and losses['pnl'].mean() != 0
            else float('inf')
        ),
        'avg_hold_minutes': (
            (trades_df['exit_time'] - trades_df['entry_time'])
            .dt.total_seconds().mean() / 60
        ),
    }
    return metrics
```

## 5. Overfitting Detection Checklist

Run ALL of these checks before trusting any backtest:

```python
def anti_overfit_report(train_metrics, val_metrics, test_metrics,
                         feature_importances, fold_results):
    """
    Returns pass/fail for each anti-overfitting check.
    """
    checks = {}
    
    # 1. Performance gap
    exp_gap = abs(train_metrics['expectancy'] - test_metrics['expectancy'])
    exp_avg = (train_metrics['expectancy'] + test_metrics['expectancy']) / 2
    checks['expectancy_gap_ok'] = (
        exp_gap / abs(exp_avg) < 0.30  # < 30% gap
        if exp_avg != 0 else True
    )
    
    # 2. Feature concentration
    max_importance = max(feature_importances.values())
    checks['no_dominant_feature'] = max_importance < 0.25  # no single > 25%
    
    # 3. Fold consistency
    fold_expectancies = [f['expectancy'] for f in fold_results]
    checks['folds_consistent'] = (
        min(fold_expectancies) > 0  # ALL folds positive
    )
    
    # 4. Session consistency (for multi-session trading)
    session_results = {f['session']: f['expectancy'] for f in fold_results
                       if 'session' in f}
    checks['sessions_consistent'] = all(
        v > 0 for v in session_results.values()
    )
    
    # 5. Sufficient trades
    checks['enough_trades'] = test_metrics['total_trades'] >= 100
    
    # 6. Profit factor sanity
    checks['pf_not_too_good'] = test_metrics['profit_factor'] < 5.0
    # PF > 5 on test set is suspicious
    
    # 7. Drawdown check
    checks['drawdown_acceptable'] = test_metrics['max_drawdown'] < 0.10
    
    return checks
```

## 6. Sample Weighting for Regime Shifts

Financial markets change regime. Weight recent + regime-matching data higher.

```python
import numpy as np

def calc_sample_weights(dates, regimes, latest_date, current_regime,
                         half_life_days=180):
    """
    Adaptive sample weighting for financial ML.
    
    Combines:
    1. Time decay (exponential, half-life 180 days)
    2. Regime matching (same regime = full weight)
    
    Why: Markets shift (e.g. Trump tariffs changed gold behavior).
         Old data from different regime is less relevant.
    """
    weights = np.zeros(len(dates))
    
    for i, (date, regime) in enumerate(zip(dates, regimes)):
        # Time decay
        days_ago = (latest_date - date).days
        time_weight = 2.0 ** (-days_ago / half_life_days)
        
        # Regime matching
        regime_weight = 1.0 if regime == current_regime else 0.3
        
        weights[i] = time_weight * regime_weight
    
    # Normalize to mean=1 (preserves effective sample size info)
    weights = weights / weights.mean()
    
    return weights
```

## 7. Key Mistakes to Avoid

| Mistake | Why It's Bad | Fix |
|---------|-------------|-----|
| Random k-fold on time series | Future data leaks into training | Purged k-fold or walk-forward |
| No transaction costs | Profitable → unprofitable when costs added | Always include spread + slippage |
| Optimizing for accuracy | High accuracy ≠ profitable trading | Optimize for expectancy |
| Single backtest period | Overfits to one market condition | Walk-forward across multiple periods |
| Using current forming bar | Looks ahead within the bar | Use LAST COMPLETED bar only |
| Ignoring regime shifts | Model trained on old regime fails | Sample weighting + regular retrain |
| Too many features vs samples | Overfitting with high-dimensional data | Feature importance → remove useless features |
| No embargo between folds | Label leakage across fold boundaries | Embargo ≥ max_label_horizon bars |

## Quick Reference

For the anti-overfit checklist as a standalone document, read `references/anti-overfit-checklist.md`.
For Python implementations of Purged K-Fold and walk-forward, read `scripts/validation.py`.
