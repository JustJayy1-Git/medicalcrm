import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthCrmShell } from "@/components/auth-crm-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUKARIENZ",
  description:
    "LUKARIENZ — patient management, scheduling, and billing for injury practices.",
  icons: {
    icon: "/logo-mono.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthCrmShell>{children}</AuthCrmShell>
      </body>
    </html>
  );
}
