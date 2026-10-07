# Blue Lock Draft maintenance

- Inspect the latest `origin/main` before making changes; it is the source of truth.
- GitHub is read-only. Never commit, push, or create PRs unless the user explicitly changes this rule. Work locally.
- Make only requested changes. Preserve gameplay and the established visual design unless explicitly asked otherwise.
- Keep classic deferred scripts; maintain their dependency order, with `js/app.js` last.
- Do not casually rewrite formation dragging. Auto Best must search every formation.
- Sharing must preserve the exact user-built formation; never run Auto Best during sharing.
- Preserve player ratings, chemistry, formation definitions, and localStorage save compatibility.
- Run `node scripts/preflight.js` (includes syntax checks for every project JavaScript file). Review the diff for unintended changes.
- Package only changed/new files with repository-relative paths; verify the ZIP listing.
- Report validation accurately. Never claim browser testing unless it was actually performed.
