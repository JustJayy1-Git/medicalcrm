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
    <section className="relative min-h-screen flex flex-col text-neutral-100 overflow-hidden">
      <span
        className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black -z-20"
        aria-hidden
      />
      <span
        className="absolute inset-0 -z-10 opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(180, 130, 50, 0.18), transparent 70%)",
        }}
      />

      <header className="relative flex items-center gap-5 px-6 py-4 border-b border-neutral-800/70 backdrop-blur-sm">
        <a href="/" className="flex items-center gap-5 hover:opacity-90 transition-opacity">
          <Image
            src="/logo-emblem.png"
            alt="Pro Injury"
            width={64}
            height={64}
            priority
          />
          <span className="text-3xl font-sans font-extrabold italic tracking-tight text-neutral-100 border-b-2 border-neon-mint/70 pb-0.5">
            CRM
          </span>
        </a>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-6 py-12">
        <section className="w-full max-w-md">
          <section className="bg-neutral-900/70 backdrop-blur-sm border border-neutral-800 rounded-2xl p-8 shadow-2xl">
            <header className="text-center mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neon-mint/80 mb-3">
                Staff Sign In
              </p>
              <h1 className="text-3xl font-serif font-semibold text-neutral-50">
                Welcome back.
              </h1>
              <p className="text-sm text-neutral-400 mt-2">
                Enter your credentials to access the portal.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="block text-sm font-medium text-neutral-300 mb-2">
                  Email
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neon-mint/50 focus:border-neon-mint/50 transition-colors"
                  placeholder="you@proinjury.com"
                />
              </label>

              <label className="block">
                <span className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-300">
                    Password
                  </span>
                  <a
                    href="/forgot-password"
                    className="text-xs text-neon-mint/80 hover:text-neon-mint transition-colors"
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
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neon-mint/50 focus:border-neon-mint/50 transition-colors"
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
                className="w-full px-6 py-3 bg-gradient-to-b from-neon-pink to-neon-mint text-neutral-950 font-semibold rounded-lg shadow-lg shadow-eggplant-900/30 hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </section>

          <p className="text-center text-xs text-neutral-500 mt-6">
            Staff access only. Unauthorized use is prohibited.
          </p>
        </section>
      </main>

      <footer className="relative px-6 py-4 text-xs text-neutral-500 border-t border-neutral-800/70 flex items-center justify-between">
        <span>© {new Date().getFullYear()} Pro Injury · All rights reserved</span>
        <span className="text-neutral-600">v0.1</span>
      </footer>
    </section>
  );
}
