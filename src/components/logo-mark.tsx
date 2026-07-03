import type { StaticImageData } from "next/image";
import brandLogoDark from "@/assets/brand/logo-header.png";
import brandLogoLight from "@/assets/brand/logo-light-header.png";

type Props = {
  /** @deprecated Sizing is controlled by width/height; kept for old call sites. */
  variant?: "header" | "icon" | "watermark";
  /**
   * Surface the logo sits on. "dark" (default) has a white wordmark for the
   * eggplant sidebar/headers; "light" has a graphite wordmark for white
   * cards and print pages.
   */
  tone?: "dark" | "light";
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

const LOGO_DARK: StaticImageData = brandLogoDark;
const LOGO_LIGHT: StaticImageData = brandLogoLight;

/** Official Pro Injury logo — caduceus/spine in laurel wreath + wordmark. */
export function LogoMark({
  tone = "dark",
  width,
  height,
  className = "",
  priority = false,
}: Props) {
  const logo = tone === "light" ? LOGO_LIGHT : LOGO_DARK;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.src}
      alt="Pro Injury"
      width={width}
      height={height}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={`block object-contain ${className}`.trim()}
      style={{ background: "transparent" }}
    />
  );
}
