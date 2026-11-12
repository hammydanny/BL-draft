# v0.8.9.2 — Secret roster stays in the secret area

Secret-roster chemistry is now visible only inside the secret area, even after the code is entered:

- A Blue Lock player's dossier never lists a secret partner. Before this release, it showed them once the session was unlocked.
- The secret characters' own dossiers still show all of their pairs, including those with Blue Lock players.
- The chemistry list hides every pair that involves a secret character. Entering the secret code in the chemistry search shows only those pairs, in the same way the character directory works.
- The database hub's "pair relationships" count and the chemistry list's total count only include public pairs.

There are no data changes: chemistry values and the secret gate are unchanged.

Tests: the in-repo preflight check now asserts that no Blue Lock dossier links to a secret character after the unlock, that the secret dossier keeps its pairs, and that the hub count excludes secret pairs.
