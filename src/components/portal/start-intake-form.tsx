"use client";

import { useFormStatus } from "react-dom";
import { startIntakePacket } from "@/app/portal/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-14 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-neon-mint to-neon-pink text-eggplant-950 shadow-lg hover:brightness-110 transition disabled:opacity-60"
    >
      {pending ? "Starting intake…" : "New patient — start intake"}
    </button>
  );
}

export function StartIntakeForm() {
  return (
    <form action={startIntakePacket}>
      <SubmitButton />
    </form>
  );
}
