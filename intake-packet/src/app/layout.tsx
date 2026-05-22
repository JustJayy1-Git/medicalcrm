import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pro Injury Intake Packet",
  description: "Staff intake packet — 8 bilingual forms",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
