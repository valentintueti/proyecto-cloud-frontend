interface Props {
  light?: boolean;
}

export function Spinner({ light }: Props) {
  return <span className={`spinner${light ? ' spinner-light' : ''}`} role="status" aria-label="Cargando" />;
}
