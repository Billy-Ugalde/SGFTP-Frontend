import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { EventItem } from '../services/informativeService';

type EventType = 'Talleres' | 'Ferias' | 'Capacitaciones' | 'Demostraciones' | 'Otros';
type EventWithType = EventItem & { type?: EventType };

const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];
const MONTH_INDEX: Record<string, number> = {
  enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,
  julio:6,agosto:7,septiembre:8,octubre:9,noviembre:10,diciembre:11
};

const PAGE_SIZE = 4;

const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); 

function parseDayMonth(spanish: string) {
  const m = normalize(spanish).match(/(\d{1,2})\s*(de)?\s*([a-z]+)/i);
  if (!m) return { day: null as number|null, month: null as number|null };
  const day = parseInt(m[1], 10);
  const monthKey = (m[3] || '').trim();
  const month = monthKey in MONTH_INDEX ? MONTH_INDEX[monthKey] : null;
  return { day: isNaN(day) ? null : day, month };
}

function eventMatchesTypes(ev: EventWithType, selected: EventType[]) {
  if (!selected.length) return true;

  const evType = (ev.type ?? 'Otros') as EventType;
  if (selected.includes(evType)) return true;

  const text = normalize(`${ev.title} ${ev.description} ${ev.date}`);
  const needles = selected.map(s => {
    switch (s) {
      case 'Talleres': return 'taller';
      case 'Ferias': return 'feria';
      case 'Capacitaciones': return 'capacita';
      case 'Demostraciones': return 'demostra';
      case 'Otros': return '';
      default: return normalize(s);
    }
  }).filter(Boolean);

  return needles.some(n => text.includes(n));
}

interface Props {
  data: EventItem[];
  title?: string;
  yearForHeader?: number; 
}

const Events: React.FC<Props> = ({ data, title, yearForHeader }) => {
  
  const today = new Date();
  const minY = today.getFullYear();
  const minM = today.getMonth();

  const firstDataMonth = useMemo(() => {
    const idx = data.map(d => parseDayMonth(d.date).month).find(m => m !== null);
    return (typeof idx === 'number') ? idx : today.getMonth();
  }, [data, today]);

  const [cursor, setCursor] = useState<{ y: number; m: number }>({
    y: yearForHeader ?? today.getFullYear(),
    m: firstDataMonth,
  });

  const goMonth = (dir: -1 | 1) => {
    let nextY = cursor.y;
    let nextM = cursor.m + dir;
    if (nextM < 0) { nextM = 11; nextY--; }
    if (nextM > 11) { nextM = 0; nextY++; }

    if (nextY < minY || (nextY === minY && nextM < minM)) return;

    setCursor({ y: nextY, m: nextM });
  };

  const monthLabel = `${MONTHS_ES[cursor.m]} ${cursor.y}`;

  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTypes, setActiveTypes] = useState<Record<EventType, boolean>>({
    Talleres: false,
    Ferias: false,
    Capacitaciones: false,
    Demostraciones: false,
    Otros: false,
  });

  const toggleType = (key: EventType) =>
    setActiveTypes(prev => ({ ...prev, [key]: !prev[key] }));

  const appliedCount = Object.values(activeTypes).filter(Boolean).length;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!wrapRef.current) return;
      const clickedInsideButtonArea = wrapRef.current.contains(t);
      const clickedInsidePanel = panelRef.current?.contains(t) ?? false;
      if (!clickedInsideButtonArea && !clickedInsidePanel) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const items: EventWithType[] = useMemo(() => {
    return data.map(e => ({ ...e, type: (e as any).type ?? 'Otros' }));
  }, [data]);

  const monthEvents = useMemo(() => {
    const selected = (Object.keys(activeTypes) as EventType[]).filter(k => activeTypes[k]);
    return items.filter(ev => {
      const { month } = parseDayMonth(ev.date);
      if (month !== cursor.m) return false;
      return eventMatchesTypes(ev, selected);
    });
  }, [items, cursor, activeTypes]);

  const totalPages = Math.ceil(monthEvents.length / PAGE_SIZE);
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [cursor, activeTypes]); 

  const pageStart = page * PAGE_SIZE;
  const pageItems = monthEvents.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <section className="events2-section section" id="eventos">
      <h2 className="section-title">{title ?? 'Próximos Eventos'}</h2>

      <div className="events2-single">
    
        <div className="events2-toolbar">
          <p className="events2-question">¿Qué tipo de evento quieres ver?</p>

          <div className="events2-filterwrap" ref={wrapRef}>
            <button
              className="events2-filterbtn"
              onClick={() => setPanelOpen(o => !o)}
              aria-expanded={panelOpen}
              aria-haspopup="dialog"
            >
              Filtros {appliedCount ? `(${appliedCount})` : '(0)'}
            </button>

            <div
              ref={panelRef}
              className={`events2-sidepanel ${panelOpen ? 'open' : ''}`}
              role="dialog"
              aria-label="Filtros"
            >
              <ul className="events2-filter-list">
                {(['Talleres','Ferias','Capacitaciones','Demostraciones','Otros'] as EventType[]).map(t => (
                  <li key={t}>
                    <label className="events2-check">
                      <input
                        type="checkbox"
                        checked={activeTypes[t]}
                        onChange={() => toggleType(t)}
                      />
                      <span>{t}</span>
                    </label>
                  </li>
                ))}
              </ul>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  className="events2-apply"
                  onClick={() => setPanelOpen(false)}
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="events2-monthbar">
          <button
            className="events2-nav"
            onClick={() => goMonth(-1)}
            disabled={cursor.y === minY && cursor.m === minM}
            aria-label="Mes anterior"
          >
            ◀
          </button>
          <div className="events2-month">{monthLabel}</div>
          <button
            className="events2-nav"
            onClick={() => goMonth(1)}
            aria-label="Mes siguiente"
          >
            ▶
          </button>
        </div>

        <div className="events2-grid">
          {pageItems.length === 0 && (
            <div className="events2-empty">No hay eventos para los filtros seleccionados.</div>
          )}

          {pageItems.map((ev, i) => (
            <article key={`${ev.title}-${i}`} className="events2-card">
              <div className="events2-date">{ev.date}</div>
              <h4 className="events2-title">{ev.title}</h4>
              <p className="events2-desc">{ev.description}</p>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="events2-bottom">
            <button
              className="events2-nav events2-prev"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Anterior
            </button>

            <div className="events2-pagenums">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`events2-pagebtn ${page === i ? 'active' : ''}`}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              className="events2-nav events2-next"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Events;
