
import type { NewsStatus } from '../Services/NewsServices';

export default function StatusBadge({ status }: { status: NewsStatus }) {
  if (status === 'archived') {
    return (
      <span className="news-status-pill news-status-pill--archived">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '0.85rem', height: '0.85rem', marginRight: '0.3rem', flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        Archivada
      </span>
    );
  }
  if (status === 'draft') {
    return (
      <span className="news-status-pill news-status-pill--draft">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '0.85rem', height: '0.85rem', marginRight: '0.3rem', flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Borrador
      </span>
    );
  }
  return <span className="news-status-pill news-status-pill--published">✓ Publicada</span>;
}
