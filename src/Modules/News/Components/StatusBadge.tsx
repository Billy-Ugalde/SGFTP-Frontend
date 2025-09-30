import React from 'react';
import type { NewsStatus } from '../Services/NewsServices';

const map: Record<NewsStatus, { text: string; className: string }> = {
  draft:     { text: 'Borrador',  className: 'news-badge news-badge--pending' },
  published: { text: 'Publicada', className: 'news-badge news-badge--success' },
  archived:  { text: 'Archivada', className: 'news-badge news-badge--danger'  },
};

const StatusBadge: React.FC<{ status: NewsStatus }> = ({ status }) => {
  const s = map[status];
  return <span className={s.className}>{s.text}</span>;
};

export default StatusBadge;
