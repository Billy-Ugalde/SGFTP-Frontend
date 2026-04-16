import React, { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { useCampaigns } from '../Services/NewsletterService';
import { CampaignDetailModal } from './CampaignDetailModal';
import CampaignStatusBadge from './CampaignStatusBadge';
import '../Styles/CampaignsList.css';

interface CampaignsListProps {
    currentPage: number;
    onPageChange: (page: number) => void;
    searchTerm?: string;
}

export const CampaignsList: React.FC<CampaignsListProps> = ({ currentPage, onPageChange, searchTerm = '' }) => {
    const { data, isLoading, error } = useCampaigns(currentPage, 10);
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

    const formatDate = (dateString: string) =>
        dateString ? new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '—';

    const filteredCampaigns = useMemo(() => {
        const campaigns = data?.campaigns || [];
        if (!searchTerm.trim()) return campaigns;
        const lower = searchTerm.toLowerCase();
        return campaigns.filter(c =>
            c.subject.toLowerCase().includes(lower) ||
            (c.sentBy?.name || '').toLowerCase().includes(lower)
        );
    }, [data, searchTerm]);

    if (isLoading) return <p className="campaigns-panel__empty">Cargando newsletters...</p>;
    if (error) return <p className="campaigns-panel__empty">Error al cargar newsletters: {error.message}</p>;
    if (!data || data.campaigns.length === 0) return <p className="campaigns-panel__empty">No hay newsletters enviados aún.</p>;

    return (
        <>
            <div className="campaigns-panel">
                <div className="campaigns-panel__table-wrapper">
                    {filteredCampaigns.length === 0 ? (
                        <p className="campaigns-panel__empty">No hay newsletters para "{searchTerm}".</p>
                    ) : (
                        <table className="campaigns-table">
                            <thead>
                                <tr>
                                    <th className="campaigns-table__th">Asunto</th>
                                    <th className="campaigns-table__th">Idioma</th>
                                    <th className="campaigns-table__th">Estado</th>
                                    <th className="campaigns-table__th">Enviado por</th>
                                    <th className="campaigns-table__th">Fecha de envío</th>
                                    <th className="campaigns-table__th campaigns-table__th--actions">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCampaigns.map((campaign) => (
                                    <tr key={campaign.id} className="campaigns-table__row">
                                        <td className="campaigns-table__td campaigns-table__td--subject">
                                            {campaign.subject}
                                        </td>
                                        <td className="campaigns-table__td campaigns-table__td--lang">
                                            {campaign.language === 'spanish' ? '🇪🇸 Español' : '🇺🇸 English'}
                                        </td>
                                        <td className="campaigns-table__td campaigns-table__td--status">
                                            <CampaignStatusBadge status={campaign.status} />
                                        </td>
                                        <td className="campaigns-table__td campaigns-table__td--sender">
                                            {campaign.sentBy?.name || '—'}
                                        </td>
                                        <td className="campaigns-table__td campaigns-table__td--date">
                                            {formatDate(campaign.sentAt)}
                                        </td>
                                        <td className="campaigns-table__td campaigns-table__td--actions">
                                            <button
                                                className="campaigns-table__detail-btn"
                                                onClick={() => setSelectedCampaignId(campaign.id)}
                                            >
                                                <Eye size={16} strokeWidth={1.75} />
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {data.totalPages > 1 && (
                    <div className="campaigns-panel__pagination">
                        <button
                            className="campaigns-panel__page-btn"
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            Anterior
                        </button>
                        <span className="campaigns-panel__page-info">
                            Página {currentPage} de {data.totalPages}
                        </span>
                        <button
                            className="campaigns-panel__page-btn"
                            disabled={currentPage === data.totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>

            <CampaignDetailModal
                campaignId={selectedCampaignId}
                onClose={() => setSelectedCampaignId(null)}
            />
        </>
    );
};
