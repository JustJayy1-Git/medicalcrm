export function StartIntakeForm() {
  return (
    <form action="/portal/start" method="POST">
      <button
        type="submit"
        className="px-14 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-neon-mint to-neon-pink text-eggplant-950 shadow-lg hover:brightness-110 transition active:brightness-95"
      >
        New patient — start intake
      </button>
    </form>
  );
}
