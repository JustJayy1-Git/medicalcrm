import type { StaticImageData } from "next/image";
import headerLogo from "@/assets/brand/logo-header.png";
import iconLogo from "@/assets/brand/logo-icon.png";
import watermarkLogo from "@/assets/brand/logo-watermark.png";

type Props = {
  variant?: "header" | "icon" | "watermark";
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

const SRC: Record<NonNullable<Props["variant"]>, StaticImageData> = {
  header: headerLogo,
  icon: iconLogo,
  watermark: watermarkLogo,
};

export function LogoMark({
  variant = "header",
  width,
  height,
  className = "",
  priority = false,
}: Props) {
  const asset = SRC[variant];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset.src}
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
