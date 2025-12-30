# Lighthouse Mobile Baseline Report

**Date**: 2025-12-30
**Agent**: OrangeSnow (claude-code, opus-4.5)
**Bead**: brenner_bot-a1c

## Test Conditions

- **Form Factor**: Mobile
- **Network**: Simulated 4G (Lighthouse default)
- **CPU**: 4x slowdown (Lighthouse default mobile throttling)
- **Environment**: Local dev server (http://localhost:3000)

## Summary

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| Home | 68 | 95 | 100 | 100 |
| Transcript | 54 | 100 | 100 | 100 |
| Distillations | 67 | 96 | 100 | 100 |
| Method | 69 | 96 | 100 | 100 |

## Core Web Vitals

| Page | FCP | LCP | TBT | CLS | SI |
|------|-----|-----|-----|-----|-----|
| Home | 1.1s | 6.7s | 390ms | 0 | 1.1s |
| Transcript | 2.7s | 9.0s | 670ms | 0 | 2.7s |
| Distillations | 1.1s | 7.0s | 380ms | 0 | 1.5s |
| Method | 1.1s | 6.7s | 360ms | 0 | 2.3s |

### Metric Thresholds (Mobile)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| FCP | ≤1.8s | 1.8-3.0s | >3.0s |
| LCP | ≤2.5s | 2.5-4.0s | >4.0s |
| TBT | ≤200ms | 200-600ms | >600ms |
| CLS | ≤0.1 | 0.1-0.25 | >0.25 |

## Key Findings

### ✅ What's Working Well

1. **Zero Layout Shift (CLS = 0)** - All pages have excellent layout stability
2. **Perfect SEO (100)** - All pages fully optimized for search engines
3. **Perfect Best Practices (100)** - Modern web standards fully implemented
4. **Excellent Accessibility (95-100)** - All pages highly accessible

### ⚠️ Areas Needing Improvement

1. **Largest Contentful Paint (LCP)**: 6.7-9.0s
   - All pages exceed the 4.0s "poor" threshold
   - Root cause: Large hero images and heavy initial render
   - Priority: **P0** - This is the primary performance bottleneck

2. **Total Blocking Time (TBT)**: 360-670ms
   - Most pages in "needs improvement" range
   - Transcript page exceeds 600ms threshold
   - Priority: **P1** - Affects interactivity

3. **First Contentful Paint (FCP)**: 1.1-2.7s
   - Most pages are acceptable (≤1.8s)
   - Transcript page at 2.7s is in "needs improvement" range
   - Priority: **P2** - Only transcript page needs attention

## Worst-Performing Page

**`/corpus/transcript`** (Performance: 54)
- FCP: 2.7s (needs improvement)
- LCP: 9.0s (poor)
- TBT: 670ms (poor)
- SI: 2.7s (needs improvement)

This page contains 236 transcript segments - the largest content load in the app. The progressive loading implementation added in commit 9a9e8aa should help, but further optimization may be needed.

## Recommendations

### Immediate (P0)

1. **Optimize LCP**
   - Implement `<link rel="preload">` for hero images
   - Consider lazy loading below-the-fold content
   - Use `next/image` with priority for LCP elements
   - Evaluate if initial transcript load can be reduced

2. **Reduce JavaScript Bundle**
   - Audit bundle with `@next/bundle-analyzer`
   - Code-split heavy components (DistillationViewer, TranscriptViewer)
   - Defer non-critical JavaScript

### Short-term (P1)

3. **Reduce TBT**
   - Break up long tasks (>50ms)
   - Use `requestIdleCallback` for non-essential work
   - Consider web workers for heavy computation

4. **Optimize Transcript Page**
   - Implement virtualization for long lists
   - Lazy load transcript sections on scroll
   - Consider pagination or infinite scroll

### Monitoring

5. **Set up CrUX monitoring**
   - Track real-user metrics via Chrome UX Report
   - Set performance budgets in CI

## Raw Reports

JSON reports saved in this directory:
- `home-local.json`
- `transcript-local.json`
- `distillations-local.json`
- `method-local.json`

## Next Steps

- [ ] Implement LCP optimizations
- [ ] Analyze bundle size
- [ ] Add virtualization to transcript page
- [ ] Set up CI performance budgets
- [ ] Re-run baseline after optimizations
