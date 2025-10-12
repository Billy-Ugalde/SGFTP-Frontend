import { useEffect, useRef, useState } from 'react';
import { useUpdateNewsStatus, type NewsStatus } from '../Services/NewsServices';
import ConfirmationModal from './ConfirmationModal';

type Props = {
  id: number;
  status?: NewsStatus;      // preferido
  current?: NewsStatus;     // compatibilidad hacia atrás
  triggerClassName?: string;
};

const OPTIONS: { key: NewsStatus; label: string; colorClass: string }[] = [
  { key: 'published', label: 'Publicada',  colorClass: 'news-status-option--published' },
  { key: 'draft',     label: 'Borrador',   colorClass: 'news-status-option--draft' },
  { key: 'archived',  label: 'Archivada',  colorClass: 'news-status-option--archived' },
];

export default function StatusButton({ id, status, current, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 180 });

  // Modal de confirmación estándar
  const [pending, setPending] = useState<NewsStatus | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
    return r;
  };

  const toggle = () => {
    if (open) { setOpen(false); return; }
    calcAnchor();
    setOpen(true);
  };

  // Cierre por scroll/resize
  useEffect(() => {
    const close = () => { setOpen(false); setPending(null); setShowConfirmModal(false); };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, []);

  const askChange = (s: NewsStatus) => {
    if (s === currentStatus) { setOpen(false); return; }
    setOpen(false);
    setPending(s);
    setShowConfirmModal(true);
  };

  const confirmChange = () => {
    if (!pending) return;
    updateStatus.mutate({ id, status: pending }, {
      onSettled: () => {
        setPending(null);
        setShowConfirmModal(false);
      }
    });
  };

  const cancelConfirm = () => {
    setPending(null);
    setShowConfirmModal(false);
  };

  return (
    <div className="news-status-dropdown" data-open={open ? 'true' : 'false'}>
      <button
        ref={btnRef}
        type="button"
        className={`news-status-trigger news-btn ${triggerClassName ?? ''}`.trim()}
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
            className="news-status-menu"
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
                className={`${o.colorClass} ${currentStatus === o.key ? 'news-status-current' : ''}`.trim()}
                onClick={() => askChange(o.key)}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* backdrop del menú */}
          <div
            className="news-status-backdrop"
            onClick={() => { setOpen(false); setPending(null); setShowConfirmModal(false); }}
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          />
        </>
      )}

      {/* Modal de confirmación estándar */}
      <ConfirmationModal
        show={showConfirmModal}
        onClose={cancelConfirm}
        onConfirm={confirmChange}
        title="Confirmar cambio de estado"
        message={`¿Estás seguro de que deseas cambiar el estado a "${
          pending === 'published' ? 'Publicada' :
          pending === 'draft' ? 'Borrador' : 'Archivada'
        }"?`}
        confirmText="Sí, cambiar"
        cancelText="Cancelar"
        type="info"
        isLoading={updateStatus.isPending}
      />
    </div>
  );
}
