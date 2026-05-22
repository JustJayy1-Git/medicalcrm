export async function StubPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-8 py-16 max-w-3xl mx-auto text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-pink mb-3">
        Coming soon
      </p>
      <h1 className="text-3xl font-serif font-semibold text-eggplant-900 mb-3">
        {title}
      </h1>
      <p className="text-vice-muted">{description}</p>
    </div>
  );
}
