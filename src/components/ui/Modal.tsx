import type { ReactNode } from 'react';
import './modal.css';

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'default' | 'large';
};

export function Modal({ title, open, onClose, children, size = 'default' }: Props) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-card${size === 'large' ? ' large' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
