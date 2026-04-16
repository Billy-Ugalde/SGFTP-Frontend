import React from 'react';
import { Mail, CheckCircle, XCircle, Users, Calendar, User } from 'lucide-react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import { useCampaign } from '../Services/NewsletterService';
import CampaignStatusBadge from './CampaignStatusBadge';
import '../Styles/CampaignDetailModal.css';

interface CampaignDetailModalProps {
    campaignId: number | null;
    onClose: () => void;
}

const formatDate = (dateString: string) =>
    dateString
        ? new Date(dateString).toLocaleDateString('es-ES', {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
          })
        : '—';

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({ campaignId, onClose }) => {
    const { data: campaign, isLoading, error } = useCampaign(campaignId ?? 0);

    const hasErrors = campaign && (campaign.status === 'failed' || campaign.status === 'partial')
        && campaign.errors && campaign.errors.length > 0;

    return (
        <GenericModal
            show={campaignId !== null}
            onClose={onClose}
            size="lg"
            closeOnBackdrop
        >
            <div className="cdm">
                {/* ── Step header ── */}
                <div className="cdm__header">
                    <div className="cdm__header-icon">
                        <Mail size={20} strokeWidth={1.75} />
                    </div>
                    <div className="cdm__header-text">
                        <h2 className="cdm__title">Detalle de campaña</h2>
                        <p className="cdm__description">Información completa del envío del newsletter</p>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="cdm__body">
                    {isLoading && (
                        <p className="cdm__empty">Cargando detalles…</p>
                    )}

                    {error && (
                        <p className="cdm__empty cdm__empty--error">Error al cargar los detalles de la campaña.</p>
                    )}

                    {campaign && (
                        <>
                            {/* Subject */}
                            <div className="cdm__subject-row">
                                <span className="cdm__subject-label">Asunto</span>
                                <p className="cdm__subject-value">{campaign.subject}</p>
                            </div>

                            {/* Meta row */}
                            <div className="cdm__meta-row">
                                <div className="cdm__meta-item">
                                    <span className="cdm__meta-icon"><User size={14} /></span>
                                    <span className="cdm__meta-text">{campaign.sentBy?.name || '—'}</span>
                                </div>
                                <div className="cdm__meta-item">
                                    <span className="cdm__meta-icon"><Calendar size={14} /></span>
                                    <span className="cdm__meta-text">{formatDate(campaign.sentAt)}</span>
                                </div>
                                <div className="cdm__meta-item">
                                    <span className="cdm__meta-text">
                                        {campaign.language === 'spanish' ? '🇪🇸 Español' : '🇺🇸 English'}
                                    </span>
                                </div>
                                <div className="cdm__meta-item">
                                    <CampaignStatusBadge status={campaign.status} />
                                </div>
                            </div>

                            {/* Stats cards */}
                            <div className="cdm__stats">
                                <div className="cdm__stat-card">
                                    <div className="cdm__stat-icon cdm__stat-icon--total">
                                        <Users size={16} strokeWidth={1.75} />
                                    </div>
                                    <div className="cdm__stat-info">
                                        <p className="cdm__stat-label">Total enviados</p>
                                        <p className="cdm__stat-value">{campaign.totalRecipients ?? 0}</p>
                                    </div>
                                </div>

                                <div className="cdm__stat-card">
                                    <div className="cdm__stat-icon cdm__stat-icon--success">
                                        <CheckCircle size={16} strokeWidth={1.75} />
                                    </div>
                                    <div className="cdm__stat-info">
                                        <p className="cdm__stat-label">Exitosos</p>
                                        <p className="cdm__stat-value cdm__stat-value--success">
                                            {campaign.successfulSends ?? 0}
                                        </p>
                                    </div>
                                </div>

                                <div className="cdm__stat-card">
                                    <div className="cdm__stat-icon cdm__stat-icon--failed">
                                        <XCircle size={16} strokeWidth={1.75} />
                                    </div>
                                    <div className="cdm__stat-info">
                                        <p className="cdm__stat-label">Fallidos</p>
                                        <p className="cdm__stat-value cdm__stat-value--failed">
                                            {campaign.failedSends ?? 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Errors section */}
                            {hasErrors && (
                                <div className="cdm__errors">
                                    <div className="cdm__errors-header">
                                        <XCircle size={15} strokeWidth={1.75} />
                                        <span>Errores de envío ({campaign.errors!.length})</span>
                                    </div>
                                    <ul className="cdm__errors-list">
                                        {campaign.errors!.map((err, i) => (
                                            <li key={i} className="cdm__error-item">{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="cdm__footer">
                    <button className="cdm__close-btn" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </GenericModal>
    );
};
