# Gold Trading ML Plugin

Build and maintain a Gold (XAU/USD) Day Trading ML system using Meta-Labeling architecture.

## Overview

A complete day trading system specification for Gold (XAU/USD) combining:
- **Multi-timeframe rule-based analysis** (H4/H1/M15/M5)
- **ML Meta-Label filtering** with ensemble models
- **ASP.NET Core dashboard** for monitoring and control

## Features

- 4-timeframe analysis: H4 (regime), H1 (direction), M15 (entry), M5 (micro)
- 65 engineered features across 6 categories
- Regime detection (Trend Up/Down, Range, Volatile)
- Ensemble ML: XGBoost(0.4) + LightGBM(0.4) + RandomForest(0.2)
- Transaction cost modeling (25pt spread + 5% ATR slippage)
- Day trading rules (max 6 trades/day, max -3% daily loss)

## Structure

```
gold-trading-ml/
├── .claude-plugin/plugin.json
├── skills/gold-trading-ml/
│   ├── SKILL.md              # Complete system specification
│   └── references/
│       └── features.md       # 65 features detailed specification
└── README.md
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| ML Service | Python FastAPI, scikit-learn, xgboost, lightgbm |
| Web App | ASP.NET Core 8 MVC, EF Core, jQuery, Bootstrap 5 |
| Database | PostgreSQL |
| Deploy | Docker Compose |

## Development Phases

1. **Phase 1:** Data + Strategy + Features
2. **Phase 2:** ML Training
3. **Phase 3:** API + Web Dashboard

## Success Criteria

- Expectancy > 0 after costs
- Profit Factor > 1.5
- Walk-forward consistency < 30% variance
- Max drawdown < 10%
- 3-8 raw signals filtered to 1-4 trades per day
