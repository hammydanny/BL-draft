# Blue Lock Draft maintenance

- Inspect the latest `origin/main` before making changes; it is the source of truth.
- GitHub commits, pushes, and pull requests are allowed only when the user explicitly requests them for the current task. Otherwise, leave the remote repository unchanged. Never force-push or overwrite collaborator work.
- Make only requested changes. Preserve gameplay and the established visual design unless explicitly asked otherwise.
- Keep classic deferred scripts; maintain their dependency order, with `js/app.js` last.
- Do not casually rewrite formation dragging. Auto Best must search every formation.
- Sharing must preserve the exact user-built formation; never run Auto Best during sharing.
- Preserve player ratings, chemistry, formation definitions, and localStorage save compatibility.
- Run `node scripts/preflight.js` (includes syntax checks for every project JavaScript file). Review the diff for unintended changes.
- After changing any cached script, stylesheet, character file or image, bump the version with `node scripts/set-version.js <next-version>` (the release fingerprint fails otherwise).
- Package only changed/new files with repository-relative paths; verify the ZIP listing.
- Report validation accurately. Never claim browser testing unless it was actually performed.
