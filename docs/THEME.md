# CRM color palette — Wynwood / Vice

**Vibe:** Deep aubergine chrome, electric mint + hot pink neon — bold, not traditional medical.

| Token | Hex | Tailwind |
|-------|-----|----------|
| Aubergine (header/sidebar) | `#1a0f24` → `#2d1838` | `eggplant-900`, `eggplant-950` |
| Electric mint | `#00f5c4` | `neon-mint` |
| Hot pink | `#ff2d8a` | `neon-pink` |
| Content surface | `#f6f0f8` | `vice-surface` |
| Borders | `#e4d4ec` | `vice-border` |

Defined in `src/app/globals.css`. Shell: `src/components/app-shell.tsx`.

## Re-apply after edits

```bash
node scripts/retheme-wynwood.mjs
# or (Windows / WSL path):
powershell -File apply-wynwood.ps1
```

## Other themes

To go back to clinical teal/slate, run `node scripts/retheme.mjs` (older script) and restore `globals.css` from git.
