import Image from "next/image";

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
  "Your care echoes long after the visit ends.",
  "Healing is a team sport — and you're on the starting line.",
  "Every claim filed, every note logged: that's somebody getting their life back.",
  "Show up. Do the work. Make it count.",
  "Patients remember how you made them feel. Today, make it good.",
];

export default function Home() {
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div className="relative min-h-screen flex flex-col text-neutral-100 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black -z-20" />
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(180, 130, 50, 0.18), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top bar */}
      <header className="relative flex items-center gap-5 px-6 py-4 border-b border-neutral-800/70 backdrop-blur-sm">
        <Image
          src="/logo-emblem.png"
          alt="Pro Injury"
          width={88}
          height={88}
          priority
        />
        <span
          className="text-4xl font-sans font-extrabold italic tracking-tight text-neutral-100 inline-block border-b-2 border-neon-mint/70 pb-0.5"
        >
          CRM
        </span>

        <nav className="ml-auto flex items-center gap-6 text-sm text-neutral-400">
          <a href="/login" className="hover:text-white transition-colors">
            Sign in
          </a>
        </nav>
      </header>

      {/* Main */}
      <main className="relative flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <Image
            src="/logo.png"
            alt="Pro Injury"
            width={84}
            height={84}
            priority
            className="mx-auto mb-5"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neon-mint/80 mb-6">
            Pro Injury · Internal Portal
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-neutral-50 mb-4 leading-tight">
            Welcome back.
          </h1>
          <p className="text-lg md:text-xl font-serif italic text-neutral-300 mb-5 leading-snug">
            “{quote}”
          </p>
          <p className="text-lg text-neutral-400 mb-12 max-w-lg mx-auto">
            Patient intake, case management, scheduling, and insurance billing —
            all in one place.
          </p>

          <div className="flex justify-center">
            <a
              href="/login"
              className="px-12 py-3.5 bg-gradient-to-b from-neon-pink to-neon-mint text-neutral-950 font-semibold rounded-lg shadow-lg shadow-eggplant-900/30 hover:brightness-110 transition-all"
            >
              Sign in
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative px-6 py-4 text-xs text-neutral-500 border-t border-neutral-800/70 flex items-center justify-between">
        <span>© {new Date().getFullYear()} Pro Injury · All rights reserved</span>
        <span className="text-neutral-600">v0.1</span>
      </footer>
    </div>
  );
}
