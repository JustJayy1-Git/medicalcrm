# CRM color palette — Wynwood / Vice

**Vibe:** Deep aubergine chrome, electric mint + hot pink neon — bold, not traditional medical.

| Token | Hex | Tailwind |
|-------|-----|----------|
| Aubergine (header/sidebar) | `#1a0f24` → `#2d1838` | `eggplant-900`, `eggplant-950` |
| Electric mint | `#00f5c4` | `neon-mint` |
| Hot pink | `#ff2d8a` | `neon-pink` |
| Content surface | `#f6f0f8` | `vice-surface` |
| Borders | `#e4d4ec` | `vice-border` |
| Champagne gold (luxury accent) | `#c9a35c` | `gold` |
| Gold bright | `#e6c987` | `gold-bright` |
| Gold soft | `#f4ead2` | `gold-soft` |

Defined in `src/app/globals.css`. Shell: `src/components/app-shell.tsx`.

## Luxury layer

Champagne-gold chrome on top of the vice palette — gold is tertiary; mint/pink stay the interactive accents.

- **Display serif** — Playfair Display (`--font-display`) backs every `font-serif` heading; loaded in `src/app/layout.tsx`.
- `.lux-gold-text` — champagne gradient text (brand wordmarks).
- `.lux-hairline` — 1px gold gradient divider element.
- `.lux-surface` — faint gold/cyan radial ambience on the main content panel.
- `.lux-card` — gold-tinted border + shadow lift on hover; add next to existing card classes.
- Gold-tinted thin scrollbars and `::selection` are global.

## Re-apply after edits

```bash
node scripts/retheme-wynwood.mjs
# or (Windows / WSL path):
powershell -File apply-wynwood.ps1
```

## Other themes

To go back to clinical teal/slate, run `node scripts/retheme.mjs` (older script) and restore `globals.css` from git.
