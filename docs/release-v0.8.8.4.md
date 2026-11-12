# v0.8.8.4 — Battle Sim tactical overhaul

## Adjust Tactics

All five controls now shape multiple layers of the live simulation rather than applying isolated, minor bonuses.

- **Tempo** changes attacking urgency, support distances and the willingness to shoot or carry the ball.
- **Directness** pushes forwards and attacking midfielders into more progressive lanes, rewards forward and through passes, and increases the willingness to accept risk when playing beyond the opposition's lines.
- **Pressing** expands the pressure radius and coordinates a presser, cover player, lane cutter and, at the highest settings, a second screen.
- **Defensive Line** changes the depth of the attacking back line and the out-of-possession defensive block.
- **Width** changes attacking lane separation and defensive compactness, so the same formation can play narrowly or stretch across the pitch.

Tactical sliders continue to update an active match immediately; changes influence the next movement and decision cycle.

## Context-aware free kicks

Free-kick layouts now use player roles, formation lanes, effective PAS/OFF/SHO/SPD/DEF attributes and both teams' tactical settings.

- Midfield free kicks designate a short outlet and a separate forward target. Teammates form passing lanes; the defending team selects a high, medium or deep block based on its pressing setting.
- Attacking free kicks give strikers, wingers, attacking midfielders, centre-backs and deeper midfielders distinct target lanes and depths.
- Defenders mark attacking threats goal-side. Direct free kicks in shooting range build a multi-player wall, with the goalkeeper shading toward the ball.
- The same selected receivers are used when the set piece is resolved, and free-kick positioning is deterministic rather than random.

## Release and compatibility

- Release version, player-module loader, service-worker cache namespace and HTML cache-busting references are aligned to 0.8.8.4.
- The release fingerprint records the updated Battle Sim, version and player-loader assets.
- Existing saved squads, line-ups, match state and legacy spatial-save migration remain supported.
