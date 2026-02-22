# Feature Specifications — Gold Trading ML

## H4 Regime Features (10)

| # | Feature | Formula / Logic | Type |
|---|---------|----------------|------|
| 1 | h4_adx_14 | ADX(14) on H4 | float |
| 2 | h4_adx_slope | (ADX[0] - ADX[-3]) / 3 | float |
| 3 | h4_ema_20_50_aligned | 1 if EMA20 > EMA50 else 0 | int |
| 4 | h4_ema_50_200_aligned | 1 if EMA50 > EMA200 else 0 | int |
| 5 | h4_ema_alignment_score | sum of (price>EMA20, EMA20>EMA50, EMA50>EMA200) → 0-3 | int |
| 6 | h4_atr_14 | ATR(14) on H4 | float |
| 7 | h4_atr_ratio | ATR(14) / ATR(50) on H4 | float |
| 8 | h4_bb_width | (BB_upper - BB_lower) / BB_middle | float |
| 9 | h4_bb_width_pctile | percentile_rank(bb_width, 100 bars) | float 0-1 |
| 10 | h4_regime | Derived label | categorical |

**Regime Rules:**
- TREND_UP: ADX > 25 AND ema_alignment_score >= 2 AND ema_20_slope > 0
- TREND_DOWN: ADX > 25 AND ema_alignment_score <= 1 AND ema_20_slope < 0
- VOLATILE: atr_ratio > 1.5 OR bb_width_pctile > 0.9
- RANGE: everything else (ADX < 20 or no clear alignment)

## H1 Direction Features (12)

| # | Feature | Formula / Logic | Type |
|---|---------|----------------|------|
| 1 | h1_ema_20_slope | (EMA20[0] - EMA20[-5]) / (5 × ATR) | float |
| 2 | h1_ema_50_slope | (EMA50[0] - EMA50[-5]) / (5 × ATR) | float |
| 3 | h1_trend_direction | +1 if both slopes > threshold, -1 if both < -threshold, else 0 | int |
| 4 | h1_rsi_14 | RSI(14) on H1 | float |
| 5 | h1_macd_histogram | MACD histogram value on H1 | float |
| 6 | h1_macd_hist_slope | (hist[0] - hist[-3]) / 3 | float |
| 7 | h1_dist_to_support | (close - nearest_support) / ATR(H1) | float |
| 8 | h1_dist_to_resistance | (nearest_resistance - close) / ATR(H1) | float |
| 9 | h1_higher_high | 1 if latest swing_high > prev swing_high | int |
| 10 | h1_higher_low | 1 if latest swing_low > prev swing_low | int |
| 11 | h1_pullback_depth | (swing_high - close) / ATR(H1) for bullish | float |
| 12 | h1_agrees_with_h4 | 1 if H1 direction matches H4 regime direction | int |

## M15 Entry Features (18)

| # | Feature | Formula / Logic | Type |
|---|---------|----------------|------|
| 1 | m15_rsi_14 | RSI(14) on M15 | float |
| 2 | m15_rsi_zone | 0=oversold(<30), 1=neutral, 2=overbought(>70) | int |
| 3 | m15_stoch_k | Stochastic %K(14,3) on M15 | float |
| 4 | m15_stoch_cross | 1 if %K crossed above %D, -1 if below, 0 none | int |
| 5 | m15_macd_histogram | MACD(12,26,9) histogram on M15 | float |
| 6 | m15_macd_hist_slope | (hist[0] - hist[-3]) / 3 | float |
| 7 | m15_macd_cross | 1 if MACD crossed signal up, -1 down, 0 none | int |
| 8 | m15_price_vs_ema20 | (close - EMA20) / ATR(M15) | float |
| 9 | m15_price_vs_ema50 | (close - EMA50) / ATR(M15) | float |
| 10 | m15_dist_to_support | (close - M15 support) / ATR(M15) | float |
| 11 | m15_dist_to_resistance | (M15 resistance - close) / ATR(M15) | float |
| 12 | m15_candle_body_ratio | abs(close-open) / (high-low) | float 0-1 |
| 13 | m15_is_engulfing | 1 if bullish/bearish engulfing | int |
| 14 | m15_is_pinbar | 1 if pin bar (wick > 2× body) | int |
| 15 | m15_consecutive_dir | count of consecutive same-direction candles | int |
| 16 | m15_atr_14 | ATR(14) on M15 | float |
| 17 | m15_atr_ratio | ATR(14) / ATR(50) on M15 | float |
| 18 | m15_squeeze | 1 if BB inside Keltner Channel | int |

## M5 Micro Features (8)

| # | Feature | Formula / Logic | Type |
|---|---------|----------------|------|
| 1 | m5_rsi_at_m15_close | RSI(14) on M5 at the time M15 bar closes | float |
| 2 | m5_macd_direction | 1 if M5 MACD hist increasing, -1 decreasing | int |
| 3 | m5_stoch_zone | 0=oversold, 1=neutral, 2=overbought | int |
| 4 | m5_last_candle_type | 1=bullish reversal, -1=bearish reversal, 0=none | int |
| 5 | m5_3bar_momentum | sum of last 3 M5 candle directions (+1/-1) | int -3..+3 |
| 6 | m5_spread_current | current spread in points | float |
| 7 | m5_spread_vs_avg | current spread / avg spread (50-bar) | float |
| 8 | m5_atr_vs_m15_atr | ATR(14,M5) / ATR(14,M15) | float |

## Session & Time Features (10)

| # | Feature | Formula / Logic | Type |
|---|---------|----------------|------|
| 1 | current_session | ASIAN(0)/LONDON(1)/NY(2)/OVERLAP(3) | int |
| 2 | is_london_ny_overlap | 1 if 12:00-16:00 UTC | int |
| 3 | hour_sin | sin(2π × hour / 24) | float |
| 4 | hour_cos | cos(2π × hour / 24) | float |
| 5 | minute_of_session | minutes since session opened | int |
| 6 | day_of_week | 0=Mon ... 4=Fri | int |
| 7 | is_monday_morning | 1 if Mon < 06:00 UTC | int |
| 8 | is_friday_afternoon | 1 if Fri > 18:00 UTC | int |
| 9 | session_range_so_far | today's range / avg daily range | float |
| 10 | is_near_news | 1 if within ±15 min of scheduled high-impact news | int |

**Session times (UTC):**
- Asian: 00:00 - 08:00
- London: 07:00 - 16:00
- NY: 12:00 - 21:00
- Overlap: 12:00 - 16:00

## Day Trading Context Features (7)

| # | Feature | Formula / Logic | Type |
|---|---------|----------------|------|
| 1 | d1_atr | ATR(14) on D1 | float |
| 2 | daily_range_pct | (today_high - today_low) / d1_atr | float |
| 3 | daily_direction | 1 if close > open for today, else -1 | int |
| 4 | dist_from_daily_open | (close - daily_open) / d1_atr | float |
| 5 | dist_from_daily_high | (close - daily_high) / d1_atr | float |
| 6 | dist_from_daily_low | (close - daily_low) / d1_atr | float |
| 7 | prev_day_direction | 1 if yesterday close > yesterday open | int |

## Normalization Rules
- All price distances: divide by ATR of the relevant timeframe
- Time: cyclical encoding (sin/cos)
- Booleans: 0/1 integer
- Regime/session: integer encoded
- NaN handling: drop first 200 M15 bars for indicator warm-up
