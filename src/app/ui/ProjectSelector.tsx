import type { ChangeEvent } from 'react';
import './layout.css';

// Placeholder selector; will be wired to real project API/store later.
const demoProjects = [
  { id: 'p1', name: 'Projekt A' },
  { id: 'p2', name: 'Projekt B' },
];

type Props = {
  value?: string;
  onChange?: (projectId: string) => void;
};

export function ProjectSelector({ value, onChange }: Props) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <label className="project-selector">
      <span>Projekt</span>
      <select value={value} onChange={handleChange}>
        {demoProjects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}
