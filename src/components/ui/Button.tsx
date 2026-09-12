import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'danger-solid' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'sm';
  loading?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  'danger-solid': 'btn-danger-solid',
  ghost: 'btn-ghost',
};

export function Button({ variant = 'secondary', size = 'md', loading, disabled, className, children, ...rest }: Props) {
  return (
    <button
      className={`btn ${variantClass[variant]} ${size === 'sm' ? 'btn-sm' : ''} ${className ?? ''}`.trim()}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner light={variant === 'primary' || variant === 'danger-solid'} />}
      {children}
    </button>
  );
}
