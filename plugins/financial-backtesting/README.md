# Financial Backtesting Plugin

Rigorous financial backtesting methodology based on Marcos Lopez de Prado's research.

## Overview

Comprehensive skill for applying proper backtesting techniques to avoid overfitting and ensure realistic performance evaluation of trading strategies.

## Features

- Triple-Barrier labeling with transaction cost modeling
- Purged K-Fold cross-validation (prevents data leakage)
- Walk-Forward validation (expanding and sliding window)
- Overfitting detection checklist (26 automated checks)
- Adaptive sample weighting (time decay + regime matching)
- Performance metrics: Expectancy, Profit Factor, Sharpe, Drawdown

## Structure

```
financial-backtesting/
├── .claude-plugin/plugin.json
├── skills/financial-backtesting/
│   ├── SKILL.md                        # Main skill instructions
│   └── references/
│       └── anti-overfit-checklist.md   # 26-item pre-flight checklist
├── scripts/
│   └── validation.py                  # PurgedKFold, WalkForwardCV implementations
└── README.md
```

## Usage

This is a knowledge/methodology skill. When working on financial ML backtesting, Claude will reference this skill for:
- Setting up proper cross-validation (purged k-fold)
- Walk-forward validation design
- Overfitting detection and prevention
- Transaction cost modeling
- Performance metric calculation and interpretation

## Key Concepts

| Concept | Description |
|---------|-------------|
| Purged K-Fold | K-fold with gap between train/test to prevent leakage |
| Walk-Forward | Rolling window validation simulating real deployment |
| Triple-Barrier | TP/SL/time barriers with transaction costs |
| Sample Weighting | Time decay + regime matching for training |
| Overfitting Detection | 7 automated checks + 26-item checklist |

## References

- Lopez de Prado, M. (2018). *Advances in Financial Machine Learning*
