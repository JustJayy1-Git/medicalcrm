"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ afterLogin }: { afterLogin: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(afterLogin);
    router.refresh();
  }

  return (
    <section className="relative min-h-screen flex flex-col text-white overflow-hidden bg-[#0c0f15]">
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, #41B6E6 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, #DB3EB1 0%, transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(135deg, #fff 1px, transparent 1px), linear-gradient(45deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="relative flex items-center gap-4 px-6 py-5 border-b border-[#41B6E6]/15 backdrop-blur-sm">
        <a href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
          <Image
            src="/logo-mono.jpg"
            alt="LUKARIENZ"
            width={52}
            height={52}
            priority
            className="rounded-md ring-1 ring-white/10"
          />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#41B6E6] leading-none mb-0.5">
              Medical CRM
            </p>
            <span className="text-2xl font-sans font-extrabold tracking-[0.14em] text-white">
              LUKARIENZ
            </span>
          </div>
        </a>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-6 py-12">
        <section className="w-full max-w-md">
          <section className="bg-[#121820]/85 backdrop-blur-md border border-[#41B6E6]/20 rounded-2xl p-8 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
            <header className="text-center mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#41B6E6] mb-3">
                Staff Sign In
              </p>
              <h1 className="text-3xl font-serif font-semibold text-white">
                Welcome back.
              </h1>
              <p className="text-sm text-[#c8d2e0]/65 mt-2">
                Sign in to LUKARIENZ — patients, billing, and reports.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="block text-sm font-medium text-[#c8d2e0] mb-2">Email</span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0c0f15] border border-[#41B6E6]/25 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#41B6E6]/45 focus:border-[#41B6E6]"
                  placeholder="you@yourpractice.com"
                />
              </label>

              <label className="block">
                <span className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#c8d2e0]">Password</span>
                  <a
                    href="/forgot-password"
                    className="text-xs text-[#41B6E6] hover:text-[#7ecff0] transition-colors"
                  >
                    Forgot?
                  </a>
                </span>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0c0f15] border border-[#41B6E6]/25 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#41B6E6]/45 focus:border-[#41B6E6]"
                  placeholder="••••••••"
                />
              </label>

              {error ? (
                <p className="px-4 py-3 bg-red-950/40 border border-red-900/60 rounded-lg text-sm text-red-300">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-white font-semibold rounded-lg shadow-lg hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in…" : "Sign in to LUKARIENZ"}
              </button>
            </form>
          </section>

          <p className="text-center text-xs text-[#c8d2e0]/45 mt-6">
            Staff CRM only — not for patient intake on the iPad.
            <br />
            <a href="/portal" className="text-[#41B6E6] hover:text-[#7ecff0] mt-1 inline-block">
              Patient intake iPad → /portal
            </a>
          </p>
        </section>
      </main>

      <footer className="relative px-6 py-4 text-xs text-[#c8d2e0]/35 border-t border-[#41B6E6]/10 flex items-center justify-between">
        <span>© {new Date().getFullYear()} LUKARIENZ</span>
        <span>v0.1</span>
      </footer>
    </section>
  );
}
