import React, { useState } from 'react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import type { Donation, UpdateDonationDto } from '../Services/DonorService';
import { DonationType, DonationTypeLabels, getDonorFullName, useCreateDonation } from '../Services/DonorService';
import '../Styles/DonorForm.css';
import { formatPhoneForDisplay } from '../../../shared/utils/phone.utils';

interface EditDonorFormProps {
  donor: Donation;
  allDonations: Donation[];
  onSubmit: (id: number, data: UpdateDonationDto) => Promise<void>;
  onCancel: () => void;
}

const getCharacterCountClass = (currentLength: number, maxLength: number) => {
  if (currentLength >= maxLength) return 'donor-form__character-count--error';
  if (currentLength >= maxLength - 10) return 'donor-form__character-count--warning';
  return '';
};

const EditDonorForm: React.FC<EditDonorFormProps> = ({ donor, allDonations, onSubmit, onCancel }) => {
  // All donations for this donor, newest first
  const donorDonations = allDonations
    .filter((d) => d.donor.idDonor === donor.donor.idDonor)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [editType, setEditType] = useState<DonationType>(DonationType.MONEY);
  const [editDetails, setEditDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [newDonationType, setNewDonationType] = useState<DonationType>(DonationType.MONEY);
  const [newDonationDetails, setNewDonationDetails] = useState('');
  const [newDonationError, setNewDonationError] = useState('');
  const [newDonationSuccess, setNewDonationSuccess] = useState('');

  const createDonationMutation = useCreateDonation();

  const handleSelectEdit = (donation: Donation) => {
    setSelectedDonation(donation);
    setEditType(donation.donationType);
    setEditDetails(donation.donationDetails || '');
    setError('');
  };

  const handleCancelEdit = () => {
    setSelectedDonation(null);
    setEditType(DonationType.MONEY);
    setEditDetails('');
    setError('');
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation) return;
    if (editDetails.trim().length < 10) {
      setError('Detalles de donación es obligatorio (mínimo 10 caracteres).');
      return;
    }
    setIsLoading(true);
    try {
      await onSubmit(selectedDonation.idDonation, {
        donationType: editType,
        donationDetails: editDetails.trim(),
      });
      handleCancelEdit();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al actualizar la donación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDonation = async () => {
    const details = newDonationDetails.trim();
    if (details.length < 10) {
      setNewDonationError('Detalles de donación es obligatorio (mínimo 10 caracteres).');
      return;
    }
    setNewDonationError('');
    setNewDonationSuccess('');
    try {
      await createDonationMutation.mutateAsync({
        firstName: donor.donor.firstName,
        secondName: donor.donor.secondName ?? undefined,
        firstLastName: donor.donor.firstLastName,
        secondLastName: donor.donor.secondLastName,
        donorType: donor.donor.donorType,
        nameCompany: donor.donor.nameCompany ?? undefined,
        interest: donor.donor.interest,
        email: donor.donor.email,
        phone: donor.donor.phone,
        donationType: newDonationType,
        donationDetails: details,
      });
      setNewDonationDetails('');
      setNewDonationType(DonationType.MONEY);
      setNewDonationSuccess('Donación agregada exitosamente.');
      setTimeout(() => setNewDonationSuccess(''), 3000);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setNewDonationError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al agregar la donación.');
    }
  };

  return (
    <GenericModal show onClose={onCancel} title="Editar Donaciones" size="lg" maxHeight>
      <div className="donor-form--edit">

      {/* ── Donor info (read-only) ── */}
      <div className="donor-form__section">
        <h3 className="donor-form__section-title">Información del Donador</h3>
        <div className="donor-form__info-box">
          <p><strong>Nombre:</strong> {getDonorFullName(donor.donor)}</p>
          <p><strong>Email:</strong> {donor.donor.email}</p>
          <p><strong>Teléfono:</strong> {formatPhoneForDisplay(donor.donor.phone)}</p>
        </div>
      </div>

      {/* ── Donation list ── */}
      <div className="donor-form__section">
        <h3 className="donor-form__section-title">Donaciones registradas</h3>

        {donorDonations.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Este donador no tiene donaciones registradas.</p>
        ) : (
          <div className="donor-form__donations-list">
            {donorDonations.map((d) => (
              <div key={d.idDonation} className={`donor-form__donation-item ${selectedDonation?.idDonation === d.idDonation ? 'donor-form__donation-item--selected' : ''}`}>
                <div className="donor-form__donation-summary">
                  <span className="donor-form__donation-type">{DonationTypeLabels[d.donationType]}</span>
                  <span className="donor-form__donation-desc">
                    {d.donationDetails && d.donationDetails.length > 80
                      ? d.donationDetails.slice(0, 80) + '…'
                      : d.donationDetails || '—'}
                  </span>
                  <span className="donor-form__donation-date">
                    {new Date(d.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {selectedDonation?.idDonation === d.idDonation ? (
                  <button type="button" className="donor-form__cancel-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={handleCancelEdit}>
                    Cancelar
                  </button>
                ) : (
                  <button type="button" className="donor-form__notation-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleSelectEdit(d)}>
                    Editar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Inline edit form for selected donation */}
        {selectedDonation && (
          <form onSubmit={handleSubmitEdit} className="donor-form__inline-edit" noValidate>
            <h4 className="donor-form__section-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              Editando donación del {new Date(selectedDonation.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
            </h4>
            <div className="donor-form__grid">
              <div className="donor-form__field">
                <label className="donor-form__label" htmlFor="editType">
                  Tipo de donación <span className="donor-form__required">*</span>
                </label>
                <select
                  id="editType"
                  className="donor-form__input"
                  value={editType}
                  onChange={(e) => { setEditType(e.target.value as DonationType); if (error) setError(''); }}
                >
                  {Object.entries(DonationTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="donor-form__field donor-form__field--full">
                <label className="donor-form__label" htmlFor="editDetails">
                  Descripción <span className="donor-form__required">*</span>
                </label>
                <textarea
                  id="editDetails"
                  className="donor-form__textarea"
                  value={editDetails}
                  onChange={(e) => { setEditDetails(e.target.value); if (error) setError(''); }}
                  maxLength={1000}
                  rows={3}
                />
                <div className="donor-form__field-info">
                  <div className="donor-form__min-length">Mínimo: 10 caracteres</div>
                  <div className={`donor-form__character-count ${getCharacterCountClass(editDetails.length, 1000)}`}>
                    {editDetails.length}/1000 caracteres
                  </div>
                </div>
              </div>
            </div>
            {error && <p className="donor-form__error-text" style={{ marginTop: '0.5rem' }}>{error}</p>}
            <div className="donor-form__actions" style={{ marginTop: '0.75rem' }}>
              <button type="button" className="donor-form__cancel-btn" onClick={handleCancelEdit} disabled={isLoading}>
                Cancelar
              </button>
              <button type="submit" className="donor-form__submit-btn" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Add new donation ── */}
      <div className="donor-form__section">
        <h3 className="donor-form__section-title">Agregar Nueva Donación</h3>
        <div className="donor-form__grid">
          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="newDonationType">
              Tipo de donación <span className="donor-form__required">*</span>
            </label>
            <select
              id="newDonationType"
              className="donor-form__input"
              value={newDonationType}
              onChange={(e) => { setNewDonationType(e.target.value as DonationType); if (newDonationError) setNewDonationError(''); }}
            >
              {Object.entries(DonationTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="donor-form__field donor-form__field--full">
            <label className="donor-form__label" htmlFor="newDonationDetails">
              Descripción <span className="donor-form__required">*</span>
            </label>
            <textarea
              id="newDonationDetails"
              className="donor-form__textarea"
              placeholder="Describe la donación..."
              value={newDonationDetails}
              onChange={(e) => { setNewDonationDetails(e.target.value); if (newDonationError) setNewDonationError(''); }}
              maxLength={1000}
              rows={3}
            />
            <div className="donor-form__field-info">
              <div className="donor-form__min-length">Mínimo: 10 caracteres</div>
              <div className={`donor-form__character-count ${getCharacterCountClass(newDonationDetails.length, 1000)}`}>
                {newDonationDetails.length}/1000 caracteres
              </div>
            </div>
          </div>
        </div>
        {newDonationError && <p className="donor-form__error-text" style={{ marginTop: '0.5rem' }}>{newDonationError}</p>}
        {newDonationSuccess && <div className="donor-form__success" style={{ marginTop: '0.5rem' }}>{newDonationSuccess}</div>}
        <button
          type="button"
          className="donor-form__notation-btn"
          onClick={handleAddDonation}
          disabled={createDonationMutation.isPending}
          style={{ marginTop: '0.75rem' }}
        >
          {createDonationMutation.isPending ? 'Agregando...' : 'Agregar Donación'}
        </button>
      </div>

      </div>{/* donor-form--edit */}
    </GenericModal>
  );
};

export default EditDonorForm;
