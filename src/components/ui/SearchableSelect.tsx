import { useMemo, useState } from 'react';

interface Props<T> {
  id: string;
  items: T[];
  value: string;
  onChange: (value: string) => void;
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  placeholder?: string;
  disabled?: boolean;
}

/** Select nativo con un filtro de texto por encima para buscar en el cliente sobre datos ya cargados. */
export function SearchableSelect<T>({ id, items, value, onChange, getId, getLabel, placeholder = 'Selecciona…', disabled }: Props<T>) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) => getLabel(item).toLowerCase().includes(q) || getId(item).toLowerCase().includes(q));
  }, [items, query, getId, getLabel]);

  return (
    <div className="stack" style={{ gap: 6 }}>
      <input
        type="search"
        placeholder="Buscar por nombre o ID…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled || items.length === 0}
        aria-label={`Buscar en ${id}`}
      />
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled || items.length === 0}>
        <option value="">{items.length === 0 ? 'No hay opciones disponibles' : placeholder}</option>
        {filtered.map((item) => (
          <option key={getId(item)} value={getId(item)}>
            {getLabel(item)}
          </option>
        ))}
      </select>
    </div>
  );
}
