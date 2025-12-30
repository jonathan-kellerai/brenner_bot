# Check Agent Mail

Check your Agent Mail inbox for the current thread: `{{session}}`

```bash
# If you have MCP Agent Mail tools available:
fetch_inbox(project_key="/data/projects/brenner_bot", agent_name="YOUR_AGENT_NAME", include_bodies=true)

# Or via the brenner CLI:
./brenner.ts mail inbox --project-key "$PWD" --agent YOUR_AGENT_NAME --threads
./brenner.ts mail thread --project-key "$PWD" --thread-id "{{session}}" --include-examples
```

Read the latest KICKOFF or instructions and prepare your response.

**Important**: The thread ID `{{session}}` is the join key for this session. All your responses must use this thread ID.
