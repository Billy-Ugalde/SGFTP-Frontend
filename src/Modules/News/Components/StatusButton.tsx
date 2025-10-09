import { useEffect, useRef, useState } from 'react';
import { useUpdateNewsStatus, type NewsStatus } from '../Services/NewsServices';

type Props = {
  id: number;
  status?: NewsStatus;      // preferido
  current?: NewsStatus;     // compatibilidad hacia atrás
  triggerClassName?: string;
};

const OPTIONS: { key: NewsStatus; label: string; colorClass: string }[] = [
  { key: 'published', label: 'Publicada', colorClass: 'status--published' },
  { key: 'draft',     label: 'Borrador',  colorClass: 'status--draft' },
  { key: 'archived',  label: 'Archivada', colorClass: 'status--archived' },
];

export default function StatusButton({ id, status, current, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 180 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const updateStatus = useUpdateNewsStatus();

  const currentStatus: NewsStatus = status ?? current ?? 'draft';

  const toggle = () => {
    if (open) return setOpen(false);
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      const minW = Math.max(180, r.width);
      // alineado al borde derecho del botón
      setPos({ top: r.bottom + 8, left: r.right - minW, width: minW });
    }
    setOpen(true);
  };

  // Cierre por scroll/resize
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, []);

  const change = (s: NewsStatus) => {
    setOpen(false);
    if (s === currentStatus) return;
    updateStatus.mutate({ id, status: s });
  };

  return (
    <div className="status-dropdown" data-open={open ? 'true' : 'false'}>
      <button
        ref={btnRef}
        type="button"
        className={`status-trigger btn ${triggerClassName ?? ''}`.trim()}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        Estado ▾
      </button>

      {open && (
        <>
          <div
            ref={menuRef}
            className="status-menu"
            role="menu"
            style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 1000 }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {OPTIONS.map(o => (
              <button
                key={o.key}
                type="button"
                role="menuitem"
                className={`${o.colorClass} ${currentStatus === o.key ? 'is-current' : ''}`.trim()}
                onClick={() => change(o.key)}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* click afuera = cerrar */}
          <div
            className="status-backdrop"
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          />
        </>
      )}
    </div>
  );
}
