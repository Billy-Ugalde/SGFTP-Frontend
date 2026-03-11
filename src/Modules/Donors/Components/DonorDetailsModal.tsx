import React, { useState } from 'react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import {
  getDonorFullName,
  type Donation,
  DonationTypeLabels,
  DonorInterestLabels,
  DonationStatusLabels,
  DonorTypeLabels,
} from '../Services/DonorService';
import '../Styles/DonorDetailsModal.css';

interface DonorDetailsModalProps {
  donor: Donation | null;
  show: boolean;
  onClose: () => void;
  allDonations: Donation[];
}

const DONATIONS_PER_PAGE = 3;

const DonorDetailsModal: React.FC<DonorDetailsModalProps> = ({ donor, show, onClose, allDonations }) => {
  const [donationsPage, setDonationsPage] = useState(1);

  if (!show || !donor) return null;

  const statusClass = donor.status ? `donor-details__badge--${String(donor.status).toLowerCase()}` : '';

  // All donations by this specific donor
  const donorDonations = allDonations
    .filter((d) => d.donor.idDonor === donor.donor.idDonor)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(donorDonations.length / DONATIONS_PER_PAGE);
  const startIndex = (donationsPage - 1) * DONATIONS_PER_PAGE;
  const paginatedDonations = donorDonations.slice(startIndex, startIndex + DONATIONS_PER_PAGE);

  return (
    <GenericModal show={show} onClose={onClose} title="Detalles del Donador" size="lg" maxHeight>
      <div>
        {/* ── Donor header ── */}
        <div className="donor-details__header">
          <h3 className="donor-details__name">{getDonorFullName(donor.donor)}</h3>
          <div className="donor-details__badges">
            <span className={`donor-details__badge ${statusClass}`}>
              {DonationStatusLabels[donor.status]}
            </span>
          </div>
        </div>

        {/* ── Donor info ── */}
        <div className="donor-details__section" style={{ marginBottom: '1.5rem' }}>
          <h4 className="donor-details__section-title">Información del Donador</h4>
          <div className="donor-details__grid">
            <div className="donor-details__field">
              <span className="donor-details__label">Nombre completo</span>
              <p className="donor-details__value">{getDonorFullName(donor.donor)}</p>
            </div>
            <div className="donor-details__field">
              <span className="donor-details__label">Tipo de donador</span>
              <p className="donor-details__value">{donor.donor.donorType ? DonorTypeLabels[donor.donor.donorType] : '—'}</p>
            </div>
            {donor.donor.nameCompany && (
              <div className="donor-details__field">
                <span className="donor-details__label">Empresa</span>
                <p className="donor-details__value">{donor.donor.nameCompany}</p>
              </div>
            )}
            <div className="donor-details__field">
              <span className="donor-details__label">Email</span>
              <p className="donor-details__value">{donor.donor.email || '—'}</p>
            </div>
            <div className="donor-details__field">
              <span className="donor-details__label">Teléfono</span>
              <p className="donor-details__value">{donor.donor.phone || '—'}</p>
            </div>
            <div className="donor-details__field">
              <span className="donor-details__label">Interés</span>
              <p className="donor-details__value">{DonorInterestLabels[donor.donor.interest]}</p>
            </div>
          </div>
        </div>

        {/* ── Donations list ── */}
        <div className="donor-details__section">
          <div className="donor-details__donations-header">
            <h4 className="donor-details__section-title" style={{ margin: 0 }}>
              Donaciones ({donorDonations.length})
            </h4>
            {totalPages > 1 && (
              <span className="donor-details__page-info">
                Página {donationsPage} de {totalPages}
              </span>
            )}
          </div>

          {donorDonations.length === 0 ? (
            <p className="donor-details__empty">No hay donaciones registradas para este donador.</p>
          ) : (
            <>
              <div className="donor-details__donations-list">
                {paginatedDonations.map((d) => (
                  <div key={d.idDonation} className="donor-details__donation-card">
                    <div className="donor-details__donation-row">
                      <span className="donor-details__donation-type">{DonationTypeLabels[d.donationType]}</span>
                      <div className="donor-details__donation-badges">
                        <span className={`donor-details__badge donor-details__badge--${String(d.status).toLowerCase()}`}>
                          {DonationStatusLabels[d.status]}
                        </span>
                      </div>
                    </div>
                    <p className="donor-details__donation-details">{d.donationDetails || '—'}</p>
                    <span className="donor-details__donation-date">
                      {new Date(d.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="donor-details__pagination">
                  <button
                    className="donor-details__page-btn"
                    onClick={() => setDonationsPage((p) => Math.max(1, p - 1))}
                    disabled={donationsPage === 1}
                  >
                    ← Anterior
                  </button>
                  <div className="donor-details__page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`donor-details__page-number ${donationsPage === page ? 'donor-details__page-number--active' : ''}`}
                        onClick={() => setDonationsPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    className="donor-details__page-btn"
                    onClick={() => setDonationsPage((p) => Math.min(totalPages, p + 1))}
                    disabled={donationsPage === totalPages}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </GenericModal>
  );
};

export default DonorDetailsModal;
