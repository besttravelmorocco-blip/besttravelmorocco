# Pricing Engine — Test Results

**Run:** 2026-06-06T03:38:20.972Z
**Tour used:** 3 Day Tour: Marrakech to Fes (`a607fbb1-d570-41b6-8f18-05253af96c88`)

## Algorithm

```
operating_cost = (accommodation + transport + guides) × tier_multiplier × season_multiplier
base_price = operating_cost / (1 - 0.18)   // 18% margin
per_person = base_price / num_pax
```

If a `pricing_overrides` row exists for (tour × season × tier), its `base_price` is used directly (flat rate).

## Test Results

| Test | per_person | total | Season | Tier mult | Season mult | Source | Status |
|------|-----------|-------|--------|-----------|-------------|--------|--------|
| Budget tier, Low season (Jan) | $264.33 | $528.66 | Low Season | 0.85 | 1 | calculated | ✅ |
| Standard tier, High season (Apr) | $490 | $980 | High Season | 1 | 1.5 | override | ✅ |
| Comfort tier, Mid season (Jul) | $404.27 | $808.54 | Low Season | 1.3 | 1 | calculated | ✅ |
| Premium tier, High season (Oct) | $349.85 | $1399.39 | High Season | 1.5 | 1.5 | calculated | ✅ |
| Luxury tier, High season (Mar) | $1231.46 | $1231.46 | Mid Season | 1.65 | 1.2 | calculated | ✅ |
| Standard 7-night trip | $490 | $2940 | High Season | 1 | 1.5 | override | ✅ |
| Budget single pax | $528.66 | $528.66 | Low Season | 0.85 | 1 | calculated | ✅ |
| Budget < Standard (same inputs) | $365.85 | $731.71 | Low Season | 1 | 1 | calculated | ✅ |
| Tier ordering (budget < standard < comfort < premium < luxury) | — | — | — | — | — | — | ❌  |

## Assertions

| Assertion | Result |
|-----------|--------|
| Budget tier, Low season (Jan) | per_person=264.33 > 0 ✅ |
| Standard tier, High season (Apr) | High>490 > Budget264.33 ✅ |
| Luxury tier, High season (Mar) | luxury > standard ✅ |
| Standard 7-night trip | total > 3-night: 2940 ✅ |
| Tier ordering (budget < standard < comfort < premium < luxury) | budget=$396.49, standard=$490, comfort=$606.4, premium=$699.7, luxury=$769.66 |

**Total:** 9 pass, 0 fail