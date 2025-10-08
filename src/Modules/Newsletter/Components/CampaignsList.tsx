import React, { useState } from 'react';
import type { CampaignStatus } from '../types/newsletter.types';
import { useCampaigns, useCampaign } from '../Services/NewsletterService';
import '../Styles/CampaignsList.css';

interface CampaignsListProps {
    currentPage: number;
    onPageChange: (page: number) => void;
}

export const CampaignsList: React.FC<CampaignsListProps> = ({ currentPage, onPageChange }) => {
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
    const { data, isLoading, error } = useCampaigns(currentPage, 5);
    const { data: campaignDetails } = useCampaign(selectedCampaignId || 0);

    const formatDate = (dateString: string) =>
        dateString ? new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : 'No disponible';

    const getStatusBadgeClass = (status: CampaignStatus) => {
        switch (status) {
            case 'completed': return 'badge--published';
            case 'failed': return 'badge--archived';
            case 'partial': return 'badge--draft';
            default: return 'badge--draft';
        }
    };

    const getStatusText = (status: CampaignStatus) => {
        switch (status) {
            case 'completed': return 'Completado';
            case 'failed': return 'Fallido';
            case 'partial': return 'Parcial';
            default: return status;
        }
    };

    if (isLoading) return <p>Cargando newsletters...</p>;
    if (error) return <p>Error al cargar newsletters: {error.message}</p>;
    if (!data || data.campaigns.length === 0) return <p>No hay newsletters enviados aún.</p>;

    return (
        <div className="campaigns-list">
            <div className="campaigns-list__header">
                <h2 className="campaigns-list__title">Historial de Newsletters</h2>
                <div className="campaigns-list__counter">
                    <span className="counter-label">Total de Newsletters:</span>
                    <span className="counter-value">{data.total || 0}</span>
                </div>
            </div>
            <br />
            {data.campaigns.map(campaign => (
                <div key={campaign.id} className="campaign-card">
                    <div className="campaign-card__header">
                        <div className="campaign-card__info">
                            <h4 className="campaign-card__subject">{campaign.subject}</h4>
                            <span className={`badge ${getStatusBadgeClass(campaign.status)}`}>
                                {getStatusText(campaign.status)}
                            </span>
                        </div>
                        <div className="campaign-card__meta">
                            <span className="campaign-card__date">Enviado: {formatDate(campaign.sentAt)}</span>
                            <span className="campaign-card__language">
                                Idioma: {campaign.language === 'spanish' ? 'Español' : 'English'}
                            </span>
                        </div>
                    </div>

                    <div className="campaign-card__content">
                        <div className="campaign-card__stats">
                            <div className="stat-item"><span className="stat-label">Total:</span> <span className="stat-value">{campaign.totalRecipients}</span></div>
                            <div className="stat-item"><span className="stat-label">Exitosos:</span> <span className="stat-value success">{campaign.successfulSends}</span></div>
                            <div className="stat-item"><span className="stat-label">Fallidos:</span> <span className="stat-value error">{campaign.failedSends}</span></div>
                        </div>

                        {campaign.sentBy && (
                            <div className="campaign-card__sender">
                                <span className="sender-label">Enviado por:</span>
                                <span className="sender-name">{campaign.sentBy.name}</span>
                            </div>
                        )}
                    </div>

                    {campaign.errors && campaign.errors.length > 0 && (
                        <div className="campaign-card__errors">
                            <button
                                className="secondary-btn small-btn"
                                onClick={() =>
                                    setSelectedCampaignId(selectedCampaignId === campaign.id ? null : campaign.id)
                                }
                            >
                                {selectedCampaignId === campaign.id ? 'Ocultar Errores' : 'Ver Errores'}
                            </button>

                            {selectedCampaignId === campaign.id && campaignDetails?.errors && (
                                <div className="errors-list">
                                    <h5>Errores de envío:</h5>
                                    <ul>
                                        {campaignDetails.errors.map((error, idx) => <li key={idx}>{error}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {data.totalPages > 1 && (
                <div className="campaigns-list__pagination">
                    <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Anterior</button>
                    <span>Página {currentPage} de {data.totalPages}</span>
                    <button disabled={currentPage === data.totalPages} onClick={() => onPageChange(currentPage + 1)}>Siguiente</button>
                </div>
            )}
        </div>
    );
};