import { LogoMark } from "@/components/logo-mark";
import { StaffLandingBackground } from "@/components/staff-landing-background";
import Link from "next/link";

const QUOTES = [
  "Every patient you help today changes a life tomorrow.",
  "Small steps, every day. That's how healing happens.",
  "You are the reason someone moves a little easier today.",
  "Compassion is the best medicine — and you've got plenty.",
  "Behind every record is a person you're helping put back together.",
  "Excellence is in the details. You sweat them so patients don't have to.",
  "Today is a new chance to be exceptional.",
  "The work you do here matters. It really does.",
  "Steady hands, steady hearts, steady progress.",
  "Be the calm in someone's worst day.",
];

export default function Home() {
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-hidden bg-[#0c0f15]">
      <StaffLandingBackground />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-[#41B6E6]/15 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <LogoMark
            variant="icon"
            width={48}
            height={48}
            priority
            className="shrink-0"
          />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#41B6E6] leading-none mb-0.5">
              Medical CRM
            </p>
            <span className="text-2xl font-sans font-extrabold tracking-[0.14em] text-white">
              LUKARIENZ
            </span>
          </div>
        </div>

        <nav>
          <Link
            href="/login"
            className="text-sm font-medium text-[#c8d2e0]/80 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          <LogoMark
            variant="header"
            width={120}
            height={120}
            priority
            className="mx-auto mb-6"
          />
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#41B6E6] mb-4">
            Staff Portal
          </p>

          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white leading-tight mb-3">
            Welcome to LUKARIENZ
          </h1>

          <div className="w-24 h-0.5 bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] mx-auto mb-8 rounded-full" />

          <p className="text-lg md:text-xl font-serif italic text-[#c8d2e0]/85 mb-5 leading-snug">
            &ldquo;{quote}&rdquo;
          </p>

          <p className="text-base md:text-lg text-[#c8d2e0]/70 mb-12 max-w-lg mx-auto leading-relaxed">
            Patient charts, injury cases, scheduling, and insurance billing — unified for your
            practice team.
          </p>

          <Link
            href="/login"
            className="inline-block px-12 py-3.5 bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-white font-semibold rounded-xl shadow-[0_8px_32px_rgba(65,182,230,0.25)] hover:brightness-110 transition-all border border-white/10"
          >
            Sign in to LUKARIENZ
          </Link>

          <p className="mt-10 text-xs text-[#c8d2e0]/40">
            Patient iPad intake is at{" "}
            <Link href="/portal" className="text-[#41B6E6] hover:text-[#7ecff0]">
              /portal
            </Link>
          </p>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4 text-xs text-[#c8d2e0]/35 border-t border-[#41B6E6]/10 flex items-center justify-between">
        <span>© {new Date().getFullYear()} LUKARIENZ</span>
        <span className="text-[#c8d2e0]/25">Pro Injury Medical · powered by LUKARIENZ</span>
      </footer>
    </div>
  );
}
