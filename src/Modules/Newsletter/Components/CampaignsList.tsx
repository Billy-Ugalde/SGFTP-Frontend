import React, { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { useCampaigns } from '../Services/NewsletterService';
import { CampaignDetailModal } from './CampaignDetailModal';
import CampaignStatusBadge from './CampaignStatusBadge';
import { ListState, EmptyState } from '../../Shared/components';
import '../Styles/CampaignsList.css';

interface CampaignsListProps {
    currentPage: number;
    onPageChange: (page: number) => void;
    searchTerm?: string;
}

export const CampaignsList: React.FC<CampaignsListProps> = ({ currentPage, onPageChange, searchTerm = '' }) => {
    const { data, isLoading, error, refetch } = useCampaigns(currentPage, 10);
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

    const handlePageChange = (page: number) => {
        onPageChange(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getPageNumbers = (totalPgs: number) => {
        const pages: number[] = [];
        if (totalPgs <= 5) {
            for (let i = 1; i <= totalPgs; i++) pages.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 5; i++) pages.push(i);
        } else if (currentPage >= totalPgs - 2) {
            for (let i = totalPgs - 4; i <= totalPgs; i++) pages.push(i);
        } else {
            for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
        }
        return pages;
    };

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

    if (isLoading || error) {
        return (
            <ListState
                isLoading={isLoading}
                error={error}
                loadingText="Cargando newsletters..."
                errorTitle="No se pudieron cargar las newsletters"
                errorDescription="Hubo un problema al obtener la informacion. Verifica tu conexion e intentalo nuevamente."
                onRetry={refetch}
            />
        );
    }
    if (!data || data.campaigns.length === 0) return <EmptyState recurso="newsletters" />;

    return (
        <>
            {filteredCampaigns.length === 0 ? (
                <EmptyState recurso="newsletters" />
            ) : (
            <div className="campaigns-panel">
                <div className="campaigns-panel__table-wrapper">
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
                                        <td className="campaigns-table__td campaigns-table__td--subject" data-label="Asunto">
                                            <span className="campaigns-table__subject-text">{campaign.subject}</span>
                                        </td>
                                        <td className="campaigns-table__td campaigns-table__td--lang" data-label="Idioma">
                                            {campaign.language === 'spanish' ? '🇪🇸 Español' : '🇺🇸 English'}
                                        </td>
                                        <td className="campaigns-table__td campaigns-table__td--status" data-label="Estado">
                                            <CampaignStatusBadge status={campaign.status} />
                                        </td>
                                        <td className="campaigns-table__td campaigns-table__td--sender" data-label="Enviado por">
                                            {campaign.sentBy?.name || '—'}
                                        </td>
                                        <td className="campaigns-table__td campaigns-table__td--date" data-label="Fecha">
                                            {formatDate(campaign.sentAt)}
                                        </td>
                                        <td className="campaigns-table__td campaigns-table__td--actions" data-label="Acciones">
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
                </div>

                {data.totalPages > 1 && (
                    <div className="campaigns-panel__pagination">
                        <button
                            className="campaigns-panel__page-btn"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Anterior
                        </button>

                        <div className="campaigns-panel__pagination-numbers">
                            {currentPage > 3 && data.totalPages > 5 && (
                                <>
                                    <button onClick={() => handlePageChange(1)} className="campaigns-panel__page-num">1</button>
                                    <span className="campaigns-panel__page-ellipsis">...</span>
                                </>
                            )}
                            {getPageNumbers(data.totalPages).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`campaigns-panel__page-num ${currentPage === page ? 'campaigns-panel__page-num--active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                            {currentPage < data.totalPages - 2 && data.totalPages > 5 && (
                                <>
                                    <span className="campaigns-panel__page-ellipsis">...</span>
                                    <button onClick={() => handlePageChange(data.totalPages)} className="campaigns-panel__page-num">{data.totalPages}</button>
                                </>
                            )}
                        </div>

                        <button
                            className="campaigns-panel__page-btn"
                            disabled={currentPage === data.totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Siguiente
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <span className="campaigns-panel__page-info">
                            {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, data.total)} de {data.total}
                        </span>
                    </div>
                )}
            </div>
            )}

            <CampaignDetailModal
                campaignId={selectedCampaignId}
                onClose={() => setSelectedCampaignId(null)}
            />
        </>
    );
};
