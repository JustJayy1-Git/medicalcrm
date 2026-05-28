import type { StaticImageData } from "next/image";
import brandLogo from "@/assets/brand/logo-header.png";

type Props = {
  /** @deprecated All variants use the same transparent logo asset. */
  variant?: "header" | "icon" | "watermark";
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

/** Single transparent logo asset — scaled per placement. */
const LOGO: StaticImageData = brandLogo;

/** Crisp black stroke around the silver logo (follows alpha). */
const LOGO_OUTLINE =
  "drop-shadow(0 0 0.6px #000) drop-shadow(0 0 0.6px #000) " +
  "drop-shadow(1px 0 0 #000) drop-shadow(-1px 0 0 #000) " +
  "drop-shadow(0 1px 0 #000) drop-shadow(0 -1px 0 #000) " +
  "drop-shadow(1px 1px 0 #000) drop-shadow(-1px -1px 0 #000) " +
  "drop-shadow(1px -1px 0 #000) drop-shadow(-1px 1px 0 #000)";

export function LogoMark({
  width,
  height,
  className = "",
  priority = false,
}: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO.src}
      alt="Pro Injury"
      width={width}
      height={height}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={`block object-contain ${className}`.trim()}
      style={{ background: "transparent", filter: LOGO_OUTLINE }}
    />
  );
}
