# Project Instructions

## Decision Graph Workflow

**THIS IS MANDATORY. Log decisions IN REAL-TIME, not retroactively.**

### The Core Rule

```
BEFORE you do something -> Log what you're ABOUT to do
AFTER it succeeds/fails -> Log the outcome
CONNECT immediately -> Link every node to its parent
AUDIT regularly -> Check for missing connections
```

### Behavioral Triggers - MUST LOG WHEN:

| Trigger | Log Type | Example |
|---------|----------|---------|
| User asks for a new feature | `goal` **with -p** | "Add dark mode" |
| Choosing between approaches | `decision` | "Choose state management" |
| About to write/edit code | `action` | "Implementing Redux store" |
| Something worked or failed | `outcome` | "Redux integration successful" |
| Notice something interesting | `observation` | "Existing code uses hooks" |

### CRITICAL: Capture User Prompts When Semantically Meaningful

**Use `-p` / `--prompt` when a user request triggers new work or changes direction.** Don't add prompts to every node - only when a prompt is the actual catalyst.

```bash
# New feature request - capture the prompt on the goal
deciduous add goal "Add auth" -c 90 -p "User asked: add login to the app"

# Downstream work links back - no prompt needed (it flows via edges)
deciduous add decision "Choose auth method" -c 75
deciduous link <goal_id> <decision_id> -r "Deciding approach"

# BUT if the user gives new direction mid-stream, capture that too
deciduous add action "Switch to OAuth" -c 85 -p "User said: use OAuth instead"
```

**When to capture prompts:**
- Root `goal` nodes: YES - the original request
- Major direction changes: YES - when user redirects the work
- Routine downstream nodes: NO - they inherit context via edges

Prompts are viewable in the TUI detail panel (`deciduous tui`) and flow through the graph via connections.

### ⚠️ CRITICAL: Maintain Connections

**The graph's value is in its CONNECTIONS, not just nodes.**

| When you create... | IMMEDIATELY link to... |
|-------------------|------------------------|
| `outcome` | The action/goal it resolves |
| `action` | The goal/decision that spawned it |
| `option` | Its parent decision |
| `observation` | Related goal/action |

**Root `goal` nodes are the ONLY valid orphans.**

### Quick Commands

```bash
deciduous add goal "Title" -c 90 -p "User's original request"
deciduous add action "Title" -c 85
deciduous link FROM TO -r "reason"  # DO THIS IMMEDIATELY!
deciduous serve   # View live (auto-refreshes every 30s)
deciduous sync    # Export for static hosting

# Metadata flags
# -c, --confidence 0-100   Confidence level
# -p, --prompt "..."       Store the user prompt (use when semantically meaningful)
# -f, --files "a.rs,b.rs"  Associate files
# -b, --branch <name>      Git branch (auto-detected)
# --commit <hash|HEAD>     Link to git commit (use HEAD for current commit)

# Branch filtering
deciduous nodes --branch main
deciduous nodes -b feature-auth
```

### ⚠️ CRITICAL: Link Commits to Actions/Outcomes

**After every git commit, link it to the decision graph!**

```bash
git commit -m "feat: add auth"
deciduous add action "Implemented auth" -c 90 --commit HEAD
deciduous link <goal_id> <action_id> -r "Implementation"
```

The `--commit HEAD` flag captures the commit hash and links it to the node. The web viewer will show commit messages, authors, and dates.

### Git History & Deployment

```bash
# Export graph AND git history for web viewer
deciduous sync

# This creates:
# - docs/graph-data.json (decision graph)
# - docs/git-history.json (commit info for linked nodes)
```

To deploy to GitHub Pages:
1. `deciduous sync` to export
2. Push to GitHub
3. Settings > Pages > Deploy from branch > /docs folder

Your graph will be live at `https://<user>.github.io/<repo>/`

### Branch-Based Grouping

Nodes are auto-tagged with the current git branch. Configure in `.deciduous/config.toml`:
```toml
[branch]
main_branches = ["main", "master"]
auto_detect = true
```

### Audit Checklist (Before Every Sync)

1. Does every **outcome** link back to what caused it?
2. Does every **action** link to why you did it?
3. Any **dangling outcomes** without parents?

### Session Start Checklist

```bash
deciduous nodes    # What decisions exist?
deciduous edges    # How are they connected? Any gaps?
git status         # Current state
```

### Multi-User Sync

Share decisions across teammates:

```bash
# Export your branch's decisions
deciduous diff export --branch feature-x -o .deciduous/patches/my-feature.json

# Apply patches from teammates (idempotent)
deciduous diff apply .deciduous/patches/*.json

# Preview before applying
deciduous diff apply --dry-run .deciduous/patches/teammate.json
```

PR workflow: Export patch → commit patch file → PR → teammates apply.

## Phoenix Museum: Capturing External References

**This is a historical archive of Phoenix Framework's development. When documenting history:**

### CRITICAL: Always Include PR/Commit References

When adding nodes about Phoenix releases or features, ALWAYS include:

1. **PR URLs in the prompt (-p flag)**:
```bash
deciduous add action "Add Channels" -c 95 -p "PRs: github.com/phoenixframework/phoenix/pull/XX, /pull/YY - description of changes"
```

2. **Commit hashes in observations**:
```bash
deciduous add observation "v0.2.0 release commit: 10ac0e1b435d8868b17e661c64143691d58a4232" -c 90
```

3. **Key contributor attributions**:
```bash
deciduous add observation "José Valim joins (PR #144, #145)" -c 95 -p "Core Elixir creator brings performance expertise"
```

### Pattern for Release Documentation

```bash
# 1. Add the release outcome
deciduous add outcome "vX.Y.0 - Feature Name (Date)" -c 90 -p "Key PRs: /pull/A, /pull/B. Commit: <hash>"

# 2. Link to previous release
deciduous link <prev_release_id> <new_release_id> -r "Next release"

# 3. Add key feature decisions/actions
deciduous add decision "Major architectural decision" -c 85 -p "Discussion: github.com/phoenixframework/phoenix/issues/XX"

# 4. Add observations for notable PRs and contributors
deciduous add observation "PR #123: Feature by @contributor" -c 80 -p "Full URL and description"
```

### Sources to Check for Each Release

1. `git log vX.Y.0..vX.Z.0` - commits between releases
2. `gh pr list --state merged --search "created:YYYY-MM-DD..YYYY-MM-DD"` - PRs in timeframe
3. GitHub release notes when available
4. CHANGELOG.md in Phoenix repo
