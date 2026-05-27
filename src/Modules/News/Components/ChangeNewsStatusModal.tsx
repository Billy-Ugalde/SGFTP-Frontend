import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { NewsStatus } from '../Services/NewsServices';
import ActivityFormDropdown from '../../Activities/Components/ActivityFormDropdown';
import '../Styles/ChangeNewsStatusModal.css';

const DRAFT_ICON = (
  <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const ARCHIVED_ICON = (
  <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

const STATUS_OPTIONS = [
  { value: 'published', label: 'Publicada', icon: <CheckCircle2 size={14} /> },
  { value: 'draft',     label: 'Borrador',  icon: DRAFT_ICON },
  { value: 'archived',  label: 'Archivada', icon: ARCHIVED_ICON },
];

const STATUS_LABELS: Record<NewsStatus, string> = {
  published: 'Publicada',
  draft:     'Borrador',
  archived:  'Archivada',
};

const STATUS_DESCRIPTIONS: Record<NewsStatus, string> = {
  published: 'La noticia está publicada y visible para todos los usuarios.',
  draft:     'La noticia está en borrador y no es visible al público.',
  archived:  'La noticia ha sido archivada y ya no aparece en la lista principal.',
};

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: (newStatus: NewsStatus) => void;
  currentStatus: NewsStatus;
  newsTitle: string;
  isLoading?: boolean;
  errorMessage?: string | null;
}

const ChangeNewsStatusModal: React.FC<Props> = ({
  show,
  onClose,
  onConfirm,
  currentStatus,
  newsTitle,
  isLoading = false,
  errorMessage,
}) => {
  const [selected, setSelected] = useState<NewsStatus>(currentStatus);

  React.useEffect(() => {
    if (show) setSelected(currentStatus);
  }, [show, currentStatus]);

  if (!show) return null;

  const badgeClass = `change-news-status-modal__status-badge change-news-status-modal__status-badge--${currentStatus}`;

  return (
    <div className="change-news-status-modal">
      <div className="change-news-status-modal__content">

        <div className="change-news-status-modal__header">
          <h2 className="change-news-status-modal__title">Cambiar estado de la noticia</h2>
        </div>

        <div className="change-news-status-modal__body">
          <p className="change-news-status-modal__intro-text">
            Estás a punto de cambiar el estado de la noticia:
          </p>
          <p className="change-news-status-modal__news-name">"{newsTitle}"</p>

          <div className="change-news-status-modal__current-status">
            <p>
              <strong>Estado actual:</strong>{' '}
              <span className={badgeClass}>{STATUS_LABELS[currentStatus]}</span>
            </p>
          </div>

          <div className="change-news-status-modal__select-group">
            <ActivityFormDropdown
              label="Nuevo estado:"
              value={selected}
              onChange={(val) => setSelected(val as NewsStatus)}
              options={STATUS_OPTIONS}
            />
            <p className="change-news-status-modal__description">
              {STATUS_DESCRIPTIONS[selected]}
            </p>
          </div>

          {selected !== currentStatus && (
            <div className="change-news-status-modal__change-notice">
              <p>
                <strong>Cambio:</strong> {STATUS_LABELS[currentStatus]} → {STATUS_LABELS[selected]}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="change-news-status-modal__error">
              <p>{errorMessage}</p>
            </div>
          )}
        </div>

        <div className="change-news-status-modal__footer">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="change-news-status-modal__button change-news-status-modal__button--cancel"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={isLoading || selected === currentStatus}
            className="change-news-status-modal__button change-news-status-modal__button--confirm"
          >
            {isLoading ? (
              <>
                <span className="change-news-status-modal__loading" />
                Cambiando...
              </>
            ) : (
              'Cambiar Estado'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChangeNewsStatusModal;
