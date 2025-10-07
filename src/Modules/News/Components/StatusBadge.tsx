import React from 'react';
import type { NewsStatus } from '../Services/NewsServices';
import '../Styles/StatusBadge.css';

const map: Record<NewsStatus, { text: string; className: string }> = {
  published: { text: 'Publicada', className: 'badge badge--success' },
  draft: { text: 'Borrador', className: 'badge badge--warning' },
  archived: { text: 'Archivada', className: 'badge badge--danger' },
};

export default function StatusBadge({ status }: { status: NewsStatus }) {
  const cfg = map[status] ?? map.draft;
  return <span className={cfg.className}>{cfg.text}</span>;
}
