export function StartIntakeForm() {
  return (
    <form action="/portal/start" method="POST" className="w-full max-w-sm">
      <button
        type="submit"
        className="w-full px-8 py-[clamp(10px,2.2dvh,14px)] text-[clamp(0.95rem,2.5dvh,1.1rem)] font-bold rounded-xl bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-white shadow-[0_8px_32px_rgba(65,182,230,0.25)] hover:brightness-110 transition active:brightness-95 border border-white/10"
      >
        <span className="block leading-tight">Start Intake</span>
        <span className="block text-[clamp(0.75rem,2dvh,0.85rem)] font-semibold opacity-90 leading-tight">
          Comenzar Admisión
        </span>
      </button>
    </form>
  );
}
