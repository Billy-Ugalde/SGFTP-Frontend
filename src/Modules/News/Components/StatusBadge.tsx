import React from 'react';
import type { NewsStatus } from '../Services/NewsServices';

const label: Record<NewsStatus, string> = {
  published: 'Publicada',
  draft: 'Borrador',
  archived: 'Archivada',
};

export default function StatusBadge({ status }: { status: NewsStatus }) {
  return <span className={`status-pill is-${status}`}>{label[status]}</span>;
}
