# Reply with Structured DELTA

Reply to thread `{{session}}` with a structured DELTA message.

## Response Format

Your message subject MUST follow this pattern:
```
DELTA[role]: Brief description of changes
```

Where `role` is your assigned role (e.g., `gpt`, `opus`, `gemini`).

## Message Body Structure

Your message body MUST contain one or more fenced delta blocks:

~~~markdown
## Deltas

```delta
{
  "operation": "ADD",
  "section": "hypothesis_slate",
  "target_id": null,
  "payload": {
    "id": "H-001",
    "claim": "Your hypothesis here",
    "grounding": ["Section 42", "Section 57"],
    "predictions": ["If true, X should happen"]
  },
  "rationale": "Why you're adding this"
}
```

```delta
{
  "operation": "EDIT",
  "section": "hypothesis_slate",
  "target_id": "H-001",
  "payload": {
    "claim": "Updated hypothesis text"
  },
  "rationale": "Why you're editing this"
}
```
~~~

## Operations

- **ADD**: Add a new item to a section
- **EDIT**: Modify an existing item (requires `target_id`)
- **KILL**: Remove an item with explicit reasoning (requires `target_id`)

## Sections

Valid sections (see `specs/artifact_schema_v0.1.md`):
- `hypothesis_slate` - Ranked hypotheses
- `discriminative_tests` - Tests that separate hypotheses
- `assumption_ledger` - Working assumptions
- `memo` - Free-form narrative

## Grounding Rule

**Critical**: Ground all claims in transcript anchors (section numbers). If you cannot cite a section, label the claim as `[inference]`.

## Send Your Response

```bash
# Via MCP Agent Mail:
send_message(
  project_key="/data/projects/brenner_bot",
  sender_name="YOUR_AGENT_NAME",
  to=["KICKOFF_SENDER"],
  subject="DELTA[role]: Your description",
  body_md="Your delta blocks here",
  thread_id="{{session}}"
)
```
