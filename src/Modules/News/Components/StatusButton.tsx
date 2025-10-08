import { useEffect, useRef, useState } from 'react';
import { useUpdateNewsStatus, type NewsStatus } from '../Services/NewsServices';

type Props = { id: number; current: NewsStatus };

export default function StatusButton({ id, current }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
    top: 0, left: 0, width: 170
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const updateStatus = useUpdateNewsStatus();

  const toggle = () => {
    if (open) return setOpen(false);
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: r.left, width: Math.max(170, r.width) });
    setOpen(true);
  };

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
    if (s === current) return;
    updateStatus.mutate({ id, status: s });
  };

  return (
    <div className="status-dropdown">
      <button
        ref={btnRef}
        type="button"
        className="status-trigger btn"  // <- hereda estilos de botón
        onClick={toggle}
      >
        Estado ▾
      </button>

      {open && (
        <>
          <div
            className="status-menu"
            style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 1000 }}
          >
            <button onClick={() => change('published')}>Publicada</button>
            <button onClick={() => change('draft')}>Borrador</button>
            <button onClick={() => change('archived')}>Archivada</button>
          </div>
          <div className="status-backdrop" onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}
