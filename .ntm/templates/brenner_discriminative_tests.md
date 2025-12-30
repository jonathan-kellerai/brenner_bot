# Request: Discriminative Tests

For thread `{{session}}`, propose discriminative tests that separate the hypotheses.

## What Makes a Good Discriminative Test

From Brenner's method:

1. **High likelihood ratios** - The test should strongly favor one hypothesis over another. Aim for "across-the-room differences" (10x-100x), not marginal effects.

2. **Digital handles** - Prefer tests with clean, unambiguous readouts (yes/no, present/absent) over continuous measurements requiring interpretation.

3. **Separation power** - Each test should separate at least 2 hypotheses. State explicitly which hypotheses the test distinguishes.

4. **Potency controls** - Include both:
   - **Chastity controls**: Does the test actually work? (positive control)
   - **Impotence controls**: Is the null really null? (negative control)

## Response Format

Submit a DELTA message with tests in this structure:

~~~markdown
```delta
{
  "operation": "ADD",
  "section": "discriminative_tests",
  "target_id": null,
  "payload": {
    "id": "DT-001",
    "test_description": "Test description here",
    "separates": ["H-001", "H-002"],
    "expected_outcomes": {
      "if_H001": "Expected result if H-001 is true",
      "if_H002": "Expected result if H-002 is true"
    },
    "potency_controls": {
      "chastity": "Positive control to verify test works",
      "impotence": "Negative control to verify null is null"
    },
    "likelihood_ratio": "Estimated ratio (e.g., >100:1 if clean readout)",
    "cost_time_estimate": "Rough estimate of resources/time"
  },
  "rationale": "Why this test is informative"
}
```
~~~

## Brenner Principles to Apply

- **Evidence per week**: Prefer cheap, fast tests over expensive, slow ones
- **Forbidden patterns**: Look for tests that could reveal forbidden combinations
- **Scale prison escape**: Consider whether the test might be confounded by scale effects
- **Third alternative**: Does the test assume a framing that could be wrong?

## Example

```delta
{
  "operation": "ADD",
  "section": "discriminative_tests",
  "target_id": null,
  "payload": {
    "id": "DT-001",
    "test_description": "Check if mechanism X requires component Y by knockout",
    "separates": ["H-001 (X requires Y)", "H-002 (X is Y-independent)"],
    "expected_outcomes": {
      "if_H001": "X activity abolished in Y knockout",
      "if_H002": "X activity unchanged in Y knockout"
    },
    "potency_controls": {
      "chastity": "Verify Y is actually knocked out by Western blot",
      "impotence": "Wild-type control shows normal X activity"
    },
    "likelihood_ratio": ">100:1 (clean digital readout)",
    "cost_time_estimate": "2 weeks, standard reagents"
  },
  "rationale": "Clean separation with digital handle and potency controls"
}
```
