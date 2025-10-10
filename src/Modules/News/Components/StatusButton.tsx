import { useEffect, useRef, useState } from 'react';
import { useUpdateNewsStatus, type NewsStatus } from '../Services/NewsServices';

type Props = {
  id: number;
  status?: NewsStatus;      // preferido
  current?: NewsStatus;     // compatibilidad hacia atrás
  triggerClassName?: string;
};

const OPTIONS: { key: NewsStatus; label: string; colorClass: string }[] = [
  { key: 'published', label: 'Publicada',  colorClass: 'status--published' },
  { key: 'draft',     label: 'Borrador',   colorClass: 'status--draft' },
  { key: 'archived',  label: 'Archivada',  colorClass: 'status--archived' },
];

export default function StatusButton({ id, status, current, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 180 });

  // Confirmación bonita anclada junto al botón
  const [pending, setPending] = useState<NewsStatus | null>(null);
  const [confirmPos, setConfirmPos] = useState<{top:number;left:number} | null>(null);

  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const updateStatus = useUpdateNewsStatus();

  const currentStatus: NewsStatus = status ?? current ?? 'draft';

  const calcAnchor = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return null;
    const minW = Math.max(180, r.width);
    // menú anclado al borde derecho del botón
    setPos({ top: r.bottom + 8, left: r.right - minW, width: minW });

    // popover de confirm a un lado del botón (preferentemente a la derecha)
    const preferredLeft = r.right + 12;
    const width = 300;
    const left =
      preferredLeft + width > window.innerWidth
        ? Math.max(12, r.left - width - 12)
        : preferredLeft;

    setConfirmPos({ top: Math.max(12, r.top - 6), left });
    return r;
  };

  const toggle = () => {
    if (open) { setOpen(false); return; }
    calcAnchor();
    setOpen(true);
  };

  // Cierre por scroll/resize
  useEffect(() => {
    const close = () => { setOpen(false); setPending(null); setConfirmPos(null); };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, []);

  const askChange = (s: NewsStatus) => {
    if (s === currentStatus) { setOpen(false); return; }
    calcAnchor();
    setPending(s);
  };

  const confirmChange = () => {
    if (!pending) return;
    setOpen(false);
    const toSend = pending;
    setPending(null);
    setConfirmPos(null);
    updateStatus.mutate({ id, status: toSend });
  };

  const cancelConfirm = () => {
    setPending(null);
    setConfirmPos(null);
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
                onClick={() => askChange(o.key)}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* backdrop del menú */}
          <div
            className="status-backdrop"
            onClick={() => { setOpen(false); setPending(null); setConfirmPos(null); }}
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          />
        </>
      )}

      {/* Popover de confirmación bonito, anclado junto al card */}
      {pending && confirmPos && (
        <>
          <div className="status-confirm" style={{ top: confirmPos.top, left: confirmPos.left }}>
            <p className="status-confirm__title">Confirmar cambio</p>
            <p className="status-confirm__text">
              ¿Deseas cambiar el estado a <strong>
                {pending === 'published' ? '“Publicada”' :
                 pending === 'draft'     ? '“Borrador”'  : '“Archivada”'}
              </strong>?
            </p>
            <div className="status-confirm__actions">
              <button className="status-confirm__btn" onClick={cancelConfirm}>No</button>
              <button className="status-confirm__btn status-confirm__btn--ok" onClick={confirmChange}>
                Sí, cambiar
              </button>
            </div>
          </div>
          <div className="status-confirm__backdrop" onClick={cancelConfirm} />
        </>
      )}
    </div>
  );
}
