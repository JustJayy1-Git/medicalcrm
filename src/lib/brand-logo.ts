/** Official Pro Injury logo paths (transparent PNGs — see design/LOGO.md). */
export const LOGO = {
  header: "/logo-header.png",
  icon: "/logo-icon.png",
  watermark: "/logo-watermark.png",
  master: "/logo.png",
} as const;

/** Fallback when sized variants are not synced yet. */
export const LOGO_FALLBACK = "/logo-emblem.png";

export function logoHeaderSrc(): string {
  return LOGO.header;
}

export function logoIconSrc(): string {
  return LOGO.icon;
}
