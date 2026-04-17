import { useState, useRef, useEffect } from 'react';
import '../../Shared/styles/StatusFilter.css';

type NewsStatus = 'all' | 'draft' | 'published';

interface Props {
  value: NewsStatus;
  onChange: (status: NewsStatus) => void;
}

const OPTIONS: { value: NewsStatus; label: string }[] = [
  { value: 'all',       label: 'Todos los estados' },
  { value: 'draft',     label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
];

export default function NewsStatusFilter({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = OPTIONS.find(o => o.value === value);

  return (
    <div className="status-filter" ref={ref}>
      <button
        type="button"
        className="status-filter__trigger"
        onClick={() => setIsOpen(v => !v)}
      >
        <div className="status-filter__trigger-content">
          <span className="status-filter__text">{selected?.label}</span>
        </div>
        <div className={`status-filter__chevron ${isOpen ? 'status-filter__chevron--open' : ''}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="status-filter__dropdown">
          <div className="status-filter__options">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`status-filter__option ${value === opt.value ? 'status-filter__option--selected' : ''}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                <div className="status-filter__option-content">
                  <span className="status-filter__option-text">{opt.label}</span>
                </div>
                {value === opt.value && (
                  <div className="status-filter__check">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
