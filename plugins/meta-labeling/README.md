# Meta-Labeling Plugin

Implement Meta-Labeling architecture for trading ML systems based on Marcos Lopez de Prado's methodology.

## Overview

Meta-Labeling is a two-layer approach where:
- **Layer 1 (Primary Strategy):** Rule-based system optimized for high recall (catches most opportunities)
- **Layer 2 (ML Meta-Label):** ML model that filters signals and sizes positions for improved precision

## Features

- Two-layer signal architecture (Rule-Based + ML)
- Triple-Barrier labeling with transaction costs
- Ensemble ML model (XGBoost + LightGBM + Random Forest)
- Confidence-based position sizing (Tiered, Linear, Kelly)
- Adaptive sample weighting with time decay and regime matching
- Risk management with daily loss limits and max concurrent positions

## Structure

```
meta-labeling/
├── .claude-plugin/plugin.json
├── skills/meta-labeling/
│   ├── SKILL.md              # Main skill instructions
│   └── references/
│       └── theory.md          # Key papers, libraries, performance benchmarks
├── scripts/
│   ├── meta_label_pipeline.py # Complete two-layer trading pipeline
│   └── position_sizing.py    # ML confidence to position size mapping
└── README.md
```

## Usage

This is a knowledge/reference skill. When working on trading ML systems, Claude will reference this skill for:
- Implementing meta-labeling architecture
- Training and evaluating ML signal filters
- Position sizing based on model confidence
- Avoiding common meta-labeling mistakes

## Key Concepts

| Concept | Description |
|---------|-------------|
| Primary Strategy | High-recall rule-based signals (~40-55% win rate) |
| Meta-Label | ML filter improving precision (~55-65% win rate) |
| Triple-Barrier | TP/SL/time-based labeling with transaction costs |
| Position Sizing | Confidence-tiered risk allocation (0.5%-1.5%) |

## References

- Lopez de Prado, M. (2018). *Advances in Financial Machine Learning*
- Singh, J. & Joubert, J. (2019). *Meta-Labeling with XGBoost*
