import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

const base =
  'w-full rounded-md border border-line bg-surface px-3.5 py-3 text-[15px] text-ink outline-none transition duration-fast placeholder:text-muted/70 focus:border-accent [color-scheme:inherit]';

export function Field({
  label,
  ...props
}: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-sm font-medium text-muted">{label}</span> : null}
      <input className={base} {...props} />
    </label>
  );
}

export function TextArea({
  label,
  ...props
}: { label?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-sm font-medium text-muted">{label}</span> : null}
      <textarea className={`${base} min-h-28 resize-none`} {...props} />
    </label>
  );
}
