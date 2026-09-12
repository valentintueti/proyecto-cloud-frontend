import type { ReactNode } from 'react';

interface Props {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  full?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, full, children }: Props) {
  return (
    <div className={`field ${error ? 'has-error' : ''} ${full ? 'field-full' : ''}`.trim()}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
