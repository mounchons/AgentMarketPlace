# Meta-Labeling Theory Reference

## Key Papers & Books
- Lopez de Prado, M. (2018) "Advances in Financial Machine Learning", Wiley
  - Chapter 3: Triple-Barrier Method & Meta-Labeling
  - Chapter 7: Cross-Validation in Finance
  - Chapter 10: Bet Sizing
- Lopez de Prado & Foreman (2014) "A Meta-Labeling Approach to ML in Finance"
- Singh & Joubert (2019) "Does Meta-Labeling Add to Signal Efficacy?" (Hudson & Thames)

## Python Libraries
- `mlfinlab` — Hudson & Thames implementation of AFML concepts
- `timeseriescv` — Purged K-Fold by Samuel Monnier (github.com/sam31415/timeseriescv)
- `xgboost`, `lightgbm` — Gradient boosting for meta-label model
- `ta` — Technical analysis indicators (pip install ta)

## Confusion Matrix for Meta-Labeling

```
                    Actual Profitable  Actual Unprofitable
ML says TRADE       True Positive      False Positive (trade losses)
ML says SKIP        False Negative     True Negative (avoided losses)
```

Goal: Maximize True Positives + True Negatives.
Primary model handles recall (catch opportunities).
ML meta-label handles precision (avoid bad ones).

## Position Sizing Methods

| Method | Formula | When to Use |
|--------|---------|-------------|
| Tiered | Fixed % per confidence band | Starting out, simple, robust |
| Linear | risk = min + (conf-0.6)/(1-0.6) × (max-min) | Smooth scaling |
| Kelly | f* = (pb - q)/b, use half-Kelly | When you have reliable win/loss stats |

## Expected Pipeline Performance

For a well-calibrated meta-labeling system on XAU/USD M15:
- Primary strategy: ~40-55% win rate (high recall)
- After ML filter: ~55-65% win rate (improved precision)
- With 2:1 RR and 55% win rate → Expectancy = +0.65 × ATR per trade
- With costs (~0.3 ATR): Net expectancy ≈ +0.35 × ATR per trade
