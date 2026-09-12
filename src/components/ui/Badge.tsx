import type { ReactNode } from 'react';

type Tone = 'default' | 'success' | 'muted' | 'accent';

const toneClass: Record<Tone, string> = {
  default: '',
  success: 'badge-success',
  muted: 'badge-muted',
  accent: 'badge-accent',
};

export function Badge({ tone = 'default', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge ${toneClass[tone]}`.trim()}>{children}</span>;
}
