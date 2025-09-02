import React, { useEffect, useState } from 'react';
import { getStatsSection } from '../../services/informativeService';
import type { StatsSectionData } from '../../services/informativeService';

type StatItem = {
  key?: string;
  title: string;
  value: string;       
  note?: string;       
};

interface Props {

  items?: Array<{ key?: string; title: string; value: string; description?: string }>;
}

const Statistics: React.FC<Props> = ({ items }) => {
  const [heading, setHeading] = useState<string>('Estadísticas');
  const [fetchedItems, setFetchedItems] = useState<StatItem[]>([]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (items && items.length) return;

    let cancelled = false;
    (async () => {
      try {
        const data: StatsSectionData = await getStatsSection();
        if (cancelled || !data) return;

        setHeading(data.title ?? 'Estadísticas');

        const mapped: StatItem[] = (data.items ?? []).map(it => ({
          key: it.key,
          title: it.title,
          value: it.value,           
          note: it.description,      
        }));

        setFetchedItems(mapped);
      } catch {
        
      }
    })();

    return () => { cancelled = true; };
  }, [items]);

  const dataToRender: StatItem[] =
    items?.length
      ? items.map(it => ({ key: it.key, title: it.title, value: it.value, note: it.description }))
      : fetchedItems;

  const toggle = (idx: number) => setOpenIdx(openIdx === idx ? null : idx);

  return (
    <section className="section stats-section" id="estadisticas">
      <h2 className="section-title">{heading}</h2>

      <div className="stats-grid">
        {dataToRender.map((it, idx) => {
          const isOpen = openIdx === idx;
          const noteId = `stat-note-${idx}`;

          return (
            <div key={it.key ?? idx} className={`stats-card${isOpen ? ' open' : ''}`}>
              <div className="stats-value">{it.value}</div>
              <div className="stats-title">{it.title}</div>

              {it.note && (
                <>
                  <button
                    type="button"
                    className="stats-more-btn"
                    aria-expanded={isOpen}
                    aria-controls={noteId}
                    onClick={() => toggle(idx)}
                  >
                    Descripción
                  </button>

                  <div
                    id={noteId}
                    className="stats-more"
                    hidden={!isOpen}
                    role="region"
                    aria-label={`Descripción de ${it.title}`}
                  >
                    {it.note}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Statistics;
