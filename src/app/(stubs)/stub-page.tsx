import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

export async function StubPage({
  active,
  title,
  description,
}: {
  active: string;
  title: string;
  description: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <AppShell user={user} active={active}>
      <div className="px-8 py-16 max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 mb-3">
          Coming soon
        </p>
        <h1 className="text-3xl font-serif font-semibold text-stone-900 mb-3">
          {title}
        </h1>
        <p className="text-stone-500">{description}</p>
      </div>
    </AppShell>
  );
}
