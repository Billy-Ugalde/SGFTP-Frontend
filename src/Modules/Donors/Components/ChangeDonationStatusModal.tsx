import React, { useState } from 'react';
import { ReadStatus, ReadStatusLabels } from '../Services/DonorService';
import '../../Activities/Styles/ChangeActivityStatusModal.css';

interface ChangeDonationStatusModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (newStatus: ReadStatus) => void;
  currentStatus: ReadStatus;
  donationId: number;
  isLoading?: boolean;
}

const ChangeDonationStatusModal: React.FC<ChangeDonationStatusModalProps> = ({
  show,
  onClose,
  onConfirm,
  currentStatus,
  donationId,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ReadStatus>(currentStatus);

  const statusDescriptions: Record<ReadStatus, string> = {
    [ReadStatus.READ]: 'La donación ha sido revisada y procesada.',
    [ReadStatus.UNREAD]: 'La donación está pendiente de revisión.',
  };

  const handleConfirm = () => {
    onConfirm(selectedStatus);
  };

  const getStatusBadgeClass = (status: ReadStatus) => {
    const classes: Record<ReadStatus, string> = {
      [ReadStatus.READ]: 'change-activity-status-modal__status-badge change-activity-status-modal__status-badge--finished',
      [ReadStatus.UNREAD]: 'change-activity-status-modal__status-badge change-activity-status-modal__status-badge--pending',
    };
    return classes[status];
  };

  if (!show) return null;

  return (
    <div className="change-activity-status-modal">
      <div className="change-activity-status-modal__content">
        {/* Header */}
        <div className="change-activity-status-modal__header">
          <h2 className="change-activity-status-modal__title">Cambiar estado de la donación</h2>
        </div>

        {/* Body */}
        <div className="change-activity-status-modal__body">
          <p className="change-activity-status-modal__intro-text">
            Estás a punto de cambiar el estado de la donación{' '}
            <span className="change-activity-status-modal__activity-name">#{donationId}</span>.
          </p>

          <div className="change-activity-status-modal__current-status">
            <p>
              <strong>Estado actual:</strong>{' '}
              <span className={getStatusBadgeClass(currentStatus)}>
                {ReadStatusLabels[currentStatus]}
              </span>
            </p>
          </div>

          <div className="change-activity-status-modal__select-group">
            <label className="change-activity-status-modal__select-label">
              Nuevo estado:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReadStatus)}
              className="change-activity-status-modal__select"
            >
              {Object.entries(ReadStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <p className="change-activity-status-modal__description">
              {statusDescriptions[selectedStatus]}
            </p>
          </div>

          {selectedStatus !== currentStatus && (
            <div className="change-activity-status-modal__change-notice">
              <p>
                <strong>Cambio:</strong> {ReadStatusLabels[currentStatus]} → {ReadStatusLabels[selectedStatus]}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="change-activity-status-modal__footer">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="change-activity-status-modal__button change-activity-status-modal__button--cancel"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || selectedStatus === currentStatus}
            className="change-activity-status-modal__button change-activity-status-modal__button--confirm"
          >
            {isLoading ? (
              <>
                <span className="change-activity-status-modal__loading"></span>
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

export default ChangeDonationStatusModal;
