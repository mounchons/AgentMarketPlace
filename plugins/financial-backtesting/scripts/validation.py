"""
Financial Time Series Cross-Validation
Based on Marcos Lopez de Prado, "Advances in Financial Machine Learning" (2018)

Implements:
- Purged K-Fold CV (Chapter 7)
- Walk-Forward Validation with embargo
- Sample weighting (time decay + regime matching)
"""

import numpy as np
import pandas as pd
from typing import Generator, Tuple, List, Optional


class PurgedKFold:
    """
    Purged K-Fold Cross-Validation for financial time series.
    
    Prevents information leakage by:
    1. Purging: removing training samples whose label period overlaps test set
    2. Embargoing: adding time gap after test set before next training fold
    
    Reference: Lopez de Prado (2018), Chapter 7
    """
    
    def __init__(self, n_splits: int = 5, embargo_pct: float = 0.02):
        """
        Args:
            n_splits: Number of folds
            embargo_pct: Fraction of total samples to embargo after each test fold
        """
        self.n_splits = n_splits
        self.embargo_pct = embargo_pct
    
    def split(
        self,
        X: pd.DataFrame,
        pred_times: pd.Series,
        eval_times: pd.Series
    ) -> Generator[Tuple[np.ndarray, np.ndarray], None, None]:
        """
        Generate train/test indices with purging and embargo.
        
        Args:
            X: Feature DataFrame (index must be datetime or aligned with pred_times)
            pred_times: Series of prediction timestamps for each sample
            eval_times: Series of evaluation timestamps (when label is determined)
        
        Yields:
            (train_indices, test_indices)
        """
        n_samples = len(X)
        embargo_size = max(1, int(n_samples * self.embargo_pct))
        fold_size = n_samples // self.n_splits
        
        indices = np.arange(n_samples)
        
        for i in range(self.n_splits):
            test_start = i * fold_size
            test_end = min((i + 1) * fold_size, n_samples)
            test_idx = indices[test_start:test_end]
            
            # Get time boundaries of test set
            test_pred_min = pred_times.iloc[test_start]
            test_eval_max = eval_times.iloc[test_end - 1]
            
            # Purge: remove train samples whose eval_time overlaps test pred_times
            # or whose pred_time falls within test eval period
            train_mask = np.ones(n_samples, dtype=bool)
            train_mask[test_start:test_end] = False
            
            for j in range(n_samples):
                if j >= test_start and j < test_end:
                    continue
                # Purge if this sample's evaluation overlaps test prediction period
                if eval_times.iloc[j] >= test_pred_min and pred_times.iloc[j] <= test_eval_max:
                    train_mask[j] = False
            
            # Embargo: remove samples right after test set
            embargo_start = test_end
            embargo_end = min(test_end + embargo_size, n_samples)
            train_mask[embargo_start:embargo_end] = False
            
            train_idx = indices[train_mask]
            
            if len(train_idx) > 0 and len(test_idx) > 0:
                yield train_idx, test_idx


class WalkForwardCV:
    """
    Walk-Forward Cross-Validation with embargo.
    
    More realistic for deployment: always train on past, test on future.
    Optionally uses expanding or sliding window.
    """
    
    def __init__(
        self,
        n_splits: int = 5,
        min_train_pct: float = 0.3,
        embargo_bars: int = 48,
        expanding: bool = True
    ):
        """
        Args:
            n_splits: Number of forward-test windows
            min_train_pct: Minimum training data as fraction of total
            embargo_bars: Gap between train and test (in bars)
            expanding: If True, train window grows. If False, sliding window.
        """
        self.n_splits = n_splits
        self.min_train_pct = min_train_pct
        self.embargo_bars = embargo_bars
        self.expanding = expanding
    
    def split(self, n_samples: int) -> Generator[Tuple[List[int], List[int]], None, None]:
        """
        Yields:
            (train_indices, test_indices)
        """
        min_train = int(n_samples * self.min_train_pct)
        remaining = n_samples - min_train - self.embargo_bars
        test_size = remaining // self.n_splits
        
        for i in range(self.n_splits):
            test_start = min_train + self.embargo_bars + (i * test_size)
            test_end = min(test_start + test_size, n_samples)
            
            if test_end > n_samples:
                break
            
            train_end = test_start - self.embargo_bars
            
            if self.expanding:
                train_start = 0
            else:
                # Sliding window: same size as initial train
                train_start = max(0, train_end - min_train)
            
            train_idx = list(range(train_start, train_end))
            test_idx = list(range(test_start, test_end))
            
            if len(train_idx) > 0 and len(test_idx) > 0:
                yield train_idx, test_idx


def calc_sample_weights(
    dates: pd.Series,
    regimes: pd.Series,
    latest_date: pd.Timestamp,
    current_regime: str,
    half_life_days: int = 180
) -> np.ndarray:
    """
    Adaptive sample weighting combining time decay and regime matching.
    
    Args:
        dates: Timestamp for each sample
        regimes: Regime label for each sample
        latest_date: Most recent date (for calculating age)
        current_regime: Current market regime
        half_life_days: Half-life for exponential time decay
    
    Returns:
        Array of sample weights (normalized to mean=1)
    """
    weights = np.zeros(len(dates))
    
    for i in range(len(dates)):
        days_ago = (latest_date - dates.iloc[i]).days
        time_weight = 2.0 ** (-days_ago / half_life_days)
        regime_weight = 1.0 if regimes.iloc[i] == current_regime else 0.3
        weights[i] = time_weight * regime_weight
    
    # Normalize
    if weights.mean() > 0:
        weights = weights / weights.mean()
    else:
        weights = np.ones(len(dates))
    
    return weights


def calc_max_drawdown(cumulative_pnl: pd.Series) -> float:
    """Calculate maximum drawdown from cumulative P&L series."""
    peak = cumulative_pnl.expanding().max()
    drawdown = (cumulative_pnl - peak) / peak.replace(0, np.nan)
    return abs(drawdown.min()) if len(drawdown) > 0 else 0.0


def calc_sharpe(returns: pd.Series, periods_per_year: int = 252 * 6) -> float:
    """
    Annualized Sharpe ratio.
    For M15 day trading: ~6 trades/day × 252 trading days = 1512 periods/year
    """
    if len(returns) < 2 or returns.std() == 0:
        return 0.0
    return (returns.mean() / returns.std()) * np.sqrt(periods_per_year)
