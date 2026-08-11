export function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label?: string;
}) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div>
      {label ? (
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm text-muted">{label}</span>
          <span className="text-sm font-semibold tabular-nums text-ink">
            {value}/{max}
          </span>
        </div>
      ) : null}
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-accent transition-all duration-base ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
