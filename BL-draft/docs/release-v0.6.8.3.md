# V0.6.8.3 Alpha — responsive tactical polish

Base: latest `main` at implementation time (`f98b86e`). GitHub remained read-only.

## Changes

- Removed the redundant Homepage fan-project/developer strip immediately above the global footer.
- Expanded the shared site/content width only on large monitors and scaled the desktop header modestly so 1600px+ / ultrawide displays use their space more naturally without altering normal laptop breakpoints.
- Increased Team Builder pitch height from `clamp(500px,65vh,640px)` to `clamp(535px,68vh,690px)` to give player names, position labels and fit markers more vertical separation.
- Increased Light Mode background-emblem visibility without changing the dark theme emblem.
- Strengthened Light Mode chemistry differentiation using distinct amber, green, blue, purple and magenta/red presentation colors and higher line contrast. Chemistry values and tiers are unchanged.
- Strengthened Light Mode BEST FIT, GOOD FIT and SWAP feedback while preserving their gold, green and blue meanings.
- Reworked the clicked pitch-player selection treatment into a dedicated cyan ring/portrait/name highlight that yields to active drag-target states.
- Bumped the central version and static cache namespace to `0.6.8.3`.

## Preservation

No player data, ratings, positions, chemistry calculations, formation coordinates, Auction rules, Auto Best logic or save keys were changed. Latest-main background-symbol and fit-color work is retained.
