# BL-Draft 0.8.9.8.10: integration and verification

Completed source recovered from task-restoration-update/repo, originally based on 9660045. No kit reimplementation was performed. The original dirty project root and recovered source are preserved.

Integrated onto latest main 1cb12df50e7c7902c8d69afc9469355d7451c1fb, retaining all intervening collaborator commits, including John's Universal Decree and six independent Absolute Authority coin flips, and the subsequent removal of Reverse Fate. John's current player module and documentation are byte-identical to that main revision. Version 0.8.9.8.10 follows the collaborator's published 0.8.9.8.9.

The downstream save test found an unrelated undefined keptEvents variable left in current main's legacy hydration branch after the Reverse Fate removal. Restored the original event-count checkpoint in that branch so legacy matches load again; current John ability implementations are preserved.

The formation and intro restoration, Isagi ability/reaction corrections, contextual Auto Subs, and Sae, Barou, Nagi, Rin and Kurona kits are preserved. The two merge conflicts retain both the shared mandatory-substitution evaluator and current half timing, and retain Hotline interruption handling while removing the retired John history collection.

## Validation

- node scripts/preflight.js was run twice. The final full invocation passed every suite through v0.8.9.1, then stopped at an old aggregate secret-roster snapshot that still expected John's previous kit. After refreshing that snapshot from independently verified current-main records, v0.8.9.4 and the next four suites passed. The presentation suite then exposed the legacy-load bug described above; after its targeted correction, presentation/save/replay, refinement and chapter checks passed. Every preflight suite has passed across these staged reruns; a third complete single-command run was not performed.
- Final node js/preflight.js integrity check: exit 0.
- Final targeted battle-restoration-tests.js: exit 0, including three seeded full matches, saved formations, physical abilities, shared cooldowns, substitutions and eleven-language kit coverage.
- Roster content, release history, collaborator preservation and version/fingerprint checks: passed. Zero stale version references and zero changed cached assets outside the stamped release.
- All 88 public non-kit profiles, all 10 secret records and source bytes, chemistry and formation definitions match current main. Only public Battle Sim kit records 1, 14, 15, 21, 23 and 26 change.
- Current-main baseline was checked against GitHub blob SHAs before integration. All existing paths are retained.
- The initial full gate exposed a John test fixture failure that also reproduces on untouched main. Decree tests now hold the competing teleport special on cooldown; deterministic coin tests account for the existing clock and movement random draws. Every current-main test assertion is retained. Roster guard fixtures update the reviewed John hash in addition to the already completed public-kit changes; the aggregate secret snapshot is repinned only after verifying every secret record and source byte against current main.
- Browser visual testing remains unverified: opening the local page failed because the browser session was unavailable. No browser or device pass is claimed.
- Existing collaborator behavior retained: John's automatic teleport can consume a simulation tick while a decree is active. The isolated decree assertions test the rule itself without changing that production precedence.

## Source receipts

- Engine SHA-256: 973de194e6a5e81860b91a04d625175c02d0bab5b2b05480146b364c5b78f9ed
- Release manifest SHA-256: d6136f952e36299ecdb5ece9c14a5267bcb61f8d70dcce7901d448d260be7498
- Full preflight log SHA-256: 67bd62eb50f5e655c248ab4a28365b6aeb054ae0ad8858a9f2593d71e47e405c

Earlier 0.8.9.8.9 review reports are retained as historical evidence of the recovered update. This report and integration-protection-v08989.json describe the final integration.
