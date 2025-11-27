
import type { NewsStatus } from '../Services/NewsServices';

const label: Record<NewsStatus, string> = {
  published: 'Publicada',
  draft: 'Borrador',
  archived: 'Archivada',
};

export default function StatusBadge({ status }: { status: NewsStatus }) {
  return <span className={`news-status-pill news-status-pill--${status}`}>{label[status]}</span>;
}
