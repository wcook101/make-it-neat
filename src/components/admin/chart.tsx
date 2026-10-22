export function BarChart({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <section className="rounded-2xl border border-white/10 bg-[#14110e] p-4">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-white">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[#b7aa9a]">Nothing to chart yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="mb-1 flex justify-between text-sm text-[#d9cbb8]">
                <span>{row.label}</span>
                <span>{row.count}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-[#e8c37a]" style={{ width: `${(row.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
