---
name: gold-trading-ml
description: Build and maintain the Gold XAU/USD Day Trading ML system using Meta-Labeling architecture. Use when creating data loaders for OHLCV data, building rule-based trading strategies (regime detection, direction analysis, entry triggers), engineering features for financial ML, training XGBoost/LightGBM/RF ensemble models, creating FastAPI ML services, building ASP.NET Core MVC trading dashboards, or any task related to the gold trading ML project. Triggers on mentions of gold trading, XAU/USD, meta-labeling, trading signals, regime detection, or financial feature engineering.
---

# Gold Trading ML — Day Trading XAU/USD

## System Overview

This project builds a **Day Trading system for Gold (XAU/USD)** using Meta-Labeling architecture with two layers:

- **Layer 1 (Rule-Based):** Generates raw BUY/SELL signals from Multi-Timeframe analysis
- **Layer 2 (ML Meta-Label):** Filters signals (trade/skip) and sizes positions using ensemble ML

**Entry:** M15 (primary) + M5 features (supplementary)
**Context:** H1 (direction) + H4 (regime)
**Goal:** Expectancy > 0, Profit Factor > 1.5

## Architecture

```
H4 Regime → H1 Direction → M15 Entry Rules → Raw Signal (BUY/SELL)
                                                    │
                                          Feature Engine (~65 features)
                                                    │
                                          ML Ensemble (XGB+LGBM+RF)
                                                    │
                                          Trade/Skip + Position Size
                                                    │
                                          FastAPI ←→ ASP.NET Core Dashboard
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| ML Service | Python FastAPI, scikit-learn, xgboost, lightgbm, ta, pandas |
| Web App | ASP.NET Core 8 MVC, EF Core, jQuery, Bootstrap 5 |
| Database | PostgreSQL |
| Deploy | Docker Compose |

## Project Structure

```
gold-trading-ml/
├── src/
│   ├── MLService/
│   │   ├── app/
│   │   │   ├── main.py, config.py
│   │   │   ├── strategy/        ← Layer 1: Rule-Based
│   │   │   │   ├── signals.py   (orchestrator)
│   │   │   │   ├── regime.py    (H4 TREND_UP/DOWN/RANGE/VOLATILE)
│   │   │   │   ├── direction.py (H1 BULLISH/BEARISH/NEUTRAL)
│   │   │   │   └── entry_rules.py (M15 triggers: pullback, RSI, S/R, candles)
│   │   │   ├── features/        ← Feature Engineering
│   │   │   │   ├── engine.py    (combines all ~65 features)
│   │   │   │   ├── h4_features.py, h1_features.py, m15_features.py
│   │   │   │   ├── m5_features.py, session.py, daytrading.py
│   │   │   ├── models/          ← Layer 2: ML Meta-Label
│   │   │   │   ├── meta_label.py, ensemble.py, trainer.py, evaluator.py
│   │   │   ├── data/
│   │   │   │   ├── loader.py, labeler.py
│   │   │   └── api/routes.py
│   └── WebApp/ (ASP.NET Core MVC)
├── data/raw/, models/, notebooks/
└── docker-compose.yml
```

## Development Phases

### Phase 1: Data + Strategy + Features
1. **Data Loader** — CSV/MT5 OHLCV for M5, M15, H1, H4, D1 (UTC datetime)
2. **Rule-Based Strategy** — H4 regime detection, H1 direction, M15 entry triggers (need ≥2 of: pullback to EMA, RSI extreme, S/R level, reversal candle, MACD shift)
3. **Feature Engine** — 65 features across 6 categories (see reference/features.md)
4. **Labeler** — Meta-label with Triple-Barrier + transaction costs (spread 25pts + slippage 5% ATR)

### Phase 2: ML Training
5. **Trainer** — Sample weighting (time_decay half-life 180d × regime_match), XGB+LGBM+RF ensemble
6. **Evaluator** — Purged K-Fold (embargo 48 M15 bars), walk-forward, per-session backtest

### Phase 3: API + Web
7. **FastAPI** — /predict, /backtest, /retrain, /health
8. **ASP.NET Core** — Dashboard, signals, performance, settings (poll every 15 min)

## Critical Rules

### Data Integrity
- NEVER use future data in features
- ALWAYS use time-series aware validation (purged K-fold, walk-forward)
- H1/H4 features: use LAST COMPLETED bar only (not current forming bar)
- Embargo ≥ 48 M15 bars between train/test folds

### Meta-Labeling
- ML does NOT generate signals — only filters Rule-Based signals
- Layer 1 produces signals FIRST → Layer 2 evaluates them
- ML target: binary 1=signal profitable, 0=signal unprofitable

### Transaction Costs (always include)
- Spread: 25 points average XAU/USD
- Slippage: 5% of ATR(M15,14)
- Include in BOTH labeling AND backtesting

### Adaptive Training
- Use ALL historical data (2022-2025) with sample weighting
- Time decay: half-life 180 days (exponential)
- Regime matching: same regime = weight 1.0, different = 0.3
- Retrain every 2 weeks with latest data

### Evaluation (Expectancy-First)
- Primary: Expectancy > 0 AND Profit Factor > 1.5
- Must be positive in EACH traded session (Asian/London/NY/Overlap)
- If session has negative expectancy → disable that session
- Anti-overfit: train/val/test expectancy gap < 30%, no feature > 25% importance

### Day Trading Rules
- Max 6 trades/day, max -3% daily loss → stop
- Max 2 concurrent positions, max 6hr hold
- No trade ±15 min around major news
- Skip if regime=VOLATILE or spread>2x average

### Code Style
- Python: type hints, docstrings, pandas DataFrames, pathlib, pytest
- .NET: standard MVC, DI, async/await, EF Core code-first

## Feature Summary (65 total)

| Category | Source | Count | Key Features |
|----------|--------|-------|-------------|
| H4 Regime | H4 | 10 | ADX, EMA alignment, ATR ratio, BB width, regime label |
| H1 Direction | H1 | 12 | EMA slopes, RSI, MACD, S/R distance, HH/HL, pullback |
| M15 Entry | M15 | 18 | RSI, Stochastic, MACD, price vs EMA, S/R, candle patterns |
| M5 Micro | M5 | 8 | RSI at M15 close, MACD direction, spread, M5/M15 ATR ratio |
| Session & Time | - | 10 | Session flags, hour sin/cos, day of week, news proximity |
| Day Trading | D1+M15 | 7 | Daily ATR, range %, direction, distance from OHLC |

For full feature specifications, read `references/features.md` in this skill directory.

## ML Configuration

```python
# XGBoost (tuned for M15 financial data)
xgb_params = {
    "max_depth": 5, "learning_rate": 0.03, "n_estimators": 800,
    "subsample": 0.7, "colsample_bytree": 0.7, "min_child_weight": 10,
    "reg_alpha": 0.3, "reg_lambda": 1.5, "gamma": 0.1
}
# Ensemble: XGB(0.4) + LGBM(0.4) + RF(0.2)

# Position sizing by confidence
# >= 0.80 → risk 1.5%, >= 0.70 → risk 1.0%, >= 0.60 → risk 0.5%, < 0.60 → SKIP
```

## Database Tables
- `signals` — raw signal + ML decision + outcome + P&L + features (JSONB)
- `daily_performance` — expectancy, PF, trades, wins, losses per day
- `model_versions` — version tracking for retrained models

## Success Criteria
- [ ] Expectancy > 0 after all costs
- [ ] Profit Factor > 1.5
- [ ] Positive expectancy in each traded session
- [ ] Consistent across walk-forward folds (variance < 30%)
- [ ] Max drawdown < 10%, max daily loss < 3%
- [ ] 3-8 raw signals/day → 1-4 trades/day after ML filter
- [ ] Retrain pipeline runs every 2 weeks
- [ ] Web dashboard shows real-time signals + performance
