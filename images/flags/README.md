# Local country flags

Nine SVGs from [flag-icons](https://github.com/lipis/flag-icons), by Panayiotis
Lipiridis, are included locally under the MIT licence. The original copyright
notice and complete licence are in [LICENSE-flag-icons.txt](LICENSE-flag-icons.txt).

Source paths: `flags/4x3/{jp,de,fr,es,br,ar,it,ng,gb-eng}.svg` in the upstream
repository, retrieved 11 October 2026. The SVG files are unmodified. No flag
package, script, stylesheet or other countries are bundled.

`GB` is the ISO parent code for the United Kingdom. The current characters with
that code represent **England** in football, so `representation: "England"`
and the local `gb-eng.svg` identify that team. This does not assert UK-wide team
membership or a citizenship status. Country labels are visible text; flag images
have empty alt text to avoid repeating the same accessible name.

The shared identity helper adds the current application cache version to each
asset URL. Native browser caching and the existing image/font worker reuse it.
