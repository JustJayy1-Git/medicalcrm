import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IntakeForm } from "./intake-form";

export default async function NewPatientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
const { data: providers } = await supabase
    .from("providers")
    .select("id, full_name, credentials")
    .eq("is_active", true)
    .order("full_name");

  const { error } = await searchParams;
  const errorMsg =
    error === "missing_name"
      ? "First and last name are required."
      : error;

  return (
    <div className="px-6 py-4 max-w-[1400px] mx-auto">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-neon-pink mb-0.5">
              New patient
            </p>
            <h1 className="text-xl font-serif font-semibold text-eggplant-900">
              Patient intake
            </h1>
          </div>
          <p className="text-vice-muted text-xs">
            * required · Tab through fields
          </p>
        </div>

        <IntakeForm providers={providers ?? []} errorMsg={errorMsg} />
      </div>
);
}
