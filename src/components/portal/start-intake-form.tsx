export function StartIntakeForm() {
  return (
    <form action="/portal/start" method="POST" className="w-full max-w-sm">
      <button
        type="submit"
        className="w-full px-10 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-[#41B6E6] to-[#DB3EB1] text-white shadow-[0_8px_32px_rgba(65,182,230,0.25)] hover:brightness-110 transition active:brightness-95 border border-white/10"
      >
        <span className="block">Start Intake</span>
        <span className="block text-sm font-semibold opacity-90 mt-0.5">Comenzar Admisión</span>
      </button>
    </form>
  );
}
