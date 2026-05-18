/**
 * Per-morph CSS filter transforms.
 * Each morph gets a unique visual treatment even when
 * base images are shared across the same species.
 */
export const MORPH_FILTERS: Record<string, string> = {
  // ── Leopard Gecko ─────────────────────────────────────────────────────────
  'lg-diablo-blanco':
    'brightness(1.15) contrast(1.1) saturate(0.1) hue-rotate(0deg)',         // near-white
  'lg-tangerine':
    'brightness(1.05) contrast(1.12) saturate(2.4) hue-rotate(-18deg)',       // vivid orange
  'lg-zero':
    'brightness(1.2) contrast(1.05) saturate(0.05) hue-rotate(0deg)',        // pale / albino
  'lg-raptor':
    'brightness(0.95) contrast(1.2) saturate(1.8) hue-rotate(5deg)',         // warm amber-red
  'lg-mack-snow':
    'brightness(1.1) contrast(1.15) saturate(0.35) hue-rotate(200deg)',      // cool icy grey
  'lg-enigma':
    'brightness(1.0) contrast(1.25) saturate(1.5) hue-rotate(-30deg)',       // warm spotted
  'lg-bold-stripe':
    'brightness(0.9) contrast(1.3) saturate(1.6) hue-rotate(15deg)',         // deep gold stripe
  'lg-blizzard':
    'brightness(1.3) contrast(0.9) saturate(0.08) hue-rotate(0deg)',         // washed-out white

  // ── Bearded Dragon ────────────────────────────────────────────────────────
  'bd-citrus-tiger':
    'brightness(1.05) contrast(1.2) saturate(2.8) hue-rotate(-15deg)',       // citrus orange tiger
  'bd-hypo':
    'brightness(1.15) contrast(1.0) saturate(0.7) hue-rotate(10deg)',        // soft hypomelanistic
  'bd-german-giant':
    'brightness(0.95) contrast(1.15) saturate(1.4) hue-rotate(5deg)',        // earthy rich
  'bd-translucent':
    'brightness(1.1) contrast(0.95) saturate(0.5) hue-rotate(180deg)',       // translucent cool
  'bd-leatherback':
    'brightness(1.0) contrast(1.2) saturate(1.9) hue-rotate(-10deg)',        // textured warm
  'bd-dunner':
    'brightness(0.9) contrast(1.25) saturate(1.7) hue-rotate(20deg)',        // deep brownish
  'bd-silkback':
    'brightness(1.2) contrast(1.05) saturate(2.2) hue-rotate(-25deg)',       // vivid silkback
  'bd-zero':
    'brightness(1.25) contrast(1.0) saturate(0.1) hue-rotate(0deg)',         // zero pigment

  // ── Crested Gecko ─────────────────────────────────────────────────────────
  'cg-flame':
    'brightness(1.0) contrast(1.2) saturate(2.5) hue-rotate(-20deg)',        // flame red-orange
  'cg-harlequin':
    'brightness(0.95) contrast(1.3) saturate(2.0) hue-rotate(10deg)',        // bold pattern
  'cg-pinstripe':
    'brightness(1.05) contrast(1.15) saturate(1.6) hue-rotate(30deg)',       // golden stripe
  'cg-phantom-pinstripe':
    'brightness(0.9) contrast(1.35) saturate(1.8) hue-rotate(-5deg)',        // dark phantom
  'cg-tricolor':
    'brightness(1.0) contrast(1.2) saturate(2.2) hue-rotate(50deg)',         // olive-green tricolor
  'cg-moonglow':
    'brightness(1.3) contrast(0.9) saturate(0.15) hue-rotate(60deg)',        // pale moonlight
  'cg-red-harlequin':
    'brightness(0.95) contrast(1.25) saturate(2.6) hue-rotate(-35deg)',      // deep red
  'cg-extreme-harlequin':
    'brightness(1.0) contrast(1.4) saturate(2.8) hue-rotate(-15deg)',        // maximum contrast

  // ── Gargoyle Gecko ────────────────────────────────────────────────────────
  'gg-striped':
    'brightness(1.0) contrast(1.2) saturate(1.5) hue-rotate(0deg)',          // natural stripe
  'gg-blotched':
    'brightness(0.9) contrast(1.3) saturate(1.3) hue-rotate(15deg)',         // dark blotch
  'gg-red-striped':
    'brightness(1.0) contrast(1.25) saturate(2.2) hue-rotate(-25deg)',       // red stripe
  'gg-orange-blotched':
    'brightness(1.05) contrast(1.15) saturate(2.4) hue-rotate(-10deg)',      // orange blotch
  'gg-reticulated':
    'brightness(0.95) contrast(1.2) saturate(1.6) hue-rotate(20deg)',        // net pattern
  'gg-super-red':
    'brightness(0.95) contrast(1.35) saturate(3.0) hue-rotate(-30deg)',      // super vivid red
  'gg-white-reticulated':
    'brightness(1.15) contrast(1.1) saturate(0.4) hue-rotate(0deg)',         // white reticulation
  'gg-red-blotched':
    'brightness(1.0) contrast(1.3) saturate(2.5) hue-rotate(-20deg)',        // red blotch
};

export function getMorphFilter(morphId: string): string {
  return MORPH_FILTERS[morphId] ?? 'none';
}
