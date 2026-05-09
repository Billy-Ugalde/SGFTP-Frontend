import { useState } from 'react';
import { useUpdateNewsStatus, type NewsStatus } from '../Services/NewsServices';
import ChangeNewsStatusModal from './ChangeNewsStatusModal';

type Props = {
  id: number;
  status?: NewsStatus;
  current?: NewsStatus;
  title?: string;
  triggerClassName?: string;
};

const REFRESH_ICON = (
  <svg className="news-list__btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default function StatusButton({ id, status, current, title = '', triggerClassName }: Props) {
  const [showModal, setShowModal] = useState(false);
  const updateStatus = useUpdateNewsStatus();

  const currentStatus: NewsStatus = status ?? current ?? 'draft';

  const handleConfirm = (newStatus: NewsStatus) => {
    updateStatus.mutate({ id, status: newStatus }, {
      onSettled: () => setShowModal(false),
    });
  };

  const btnClass = [
    'news-list__btn',
    `news-list__btn--status-${currentStatus}`,
    triggerClassName ?? '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <button
        type="button"
        className={btnClass}
        onClick={() => setShowModal(true)}
        disabled={updateStatus.isPending}
      >
        {REFRESH_ICON}
        {updateStatus.isPending ? 'Cambiando...' : 'Estado'}
      </button>

      <ChangeNewsStatusModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        currentStatus={currentStatus}
        newsTitle={title}
        isLoading={updateStatus.isPending}
      />
    </>
  );
}
