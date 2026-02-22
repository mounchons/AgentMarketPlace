# Anti-Overfitting Checklist for Financial ML

Run through EVERY item before deploying a trading model.

## Pre-Training Checks

- [ ] **No future leakage in features** — Every feature at time T uses only data from T-1 or earlier
- [ ] **H1/H4 features use last COMPLETED bar** — Not the currently forming bar
- [ ] **Labels use Triple-Barrier** — Not fixed-horizon returns
- [ ] **Transaction costs included in labels** — Spread + slippage factored into TP/SL calculation
- [ ] **Sufficient data volume** — At least 500+ labeled samples for 65 features
- [ ] **Features are ATR-normalized** — No raw price values as features

## Training Checks

- [ ] **Time-series split only** — Never random shuffle
- [ ] **Purge applied** — Training samples near test boundaries removed
- [ ] **Embargo applied** — Gap of ≥ max_label_horizon bars between folds
- [ ] **Sample weighting active** — Recent data weighted more than old
- [ ] **Regularization tuned** — max_depth ≤ 6, min_child_weight ≥ 5, subsample < 1.0
- [ ] **Early stopping enabled** — Prevents training beyond optimal point

## Post-Training Validation

- [ ] **Train/Val/Test expectancy gap < 30%** — Similar performance across splits
- [ ] **No single feature > 25% importance** — Model not over-reliant on one signal
- [ ] **ALL walk-forward folds positive expectancy** — Not just average
- [ ] **ALL traded sessions positive expectancy** — Asian, London, NY individually
- [ ] **Profit Factor between 1.5 and 5.0** — PF > 5 is suspicious (likely overfit)
- [ ] **Drawdown < 10%** — Manageable risk
- [ ] **At least 100 trades in test set** — Statistical significance
- [ ] **Works in trending AND ranging regimes** — Not regime-specific

## Red Flags (Immediate Investigation Required)

- Test accuracy > 85% → almost certainly overfit or data leakage
- Profit factor > 5.0 → too good to be true
- Train accuracy >> Test accuracy (gap > 15%) → classic overfitting
- Model works only in one session → may be fitting to session-specific noise
- One feature has > 40% importance → model is a proxy for one indicator
- Performance degrades sharply on most recent data → regime shift not handled

## Deployment Safety

- [ ] **Paper trade for 2+ weeks** before real money
- [ ] **Daily loss limit (-3%)** enforced in code
- [ ] **Max position limit** enforced
- [ ] **Retrain schedule** every 2 weeks with fresh data
- [ ] **Performance monitoring** with alerting on expectancy drop
- [ ] **Kill switch** to stop trading if drawdown exceeds threshold
