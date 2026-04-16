import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import { useSubscribersCount, useSubscribersList } from '../Services/NewsletterService';
import type { CampaignLanguage } from '../types/newsletter.types';
import '../Styles/SubscribersStats.css';

interface SubscribersStatsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    selectedLanguage?: 'es' | 'en';
    setSelectedLanguage?: (lang?: 'es' | 'en') => void;
    searchTerm?: string;
}

const renderFlag = (lang?: string | null) => {
    if (!lang) return null;
    const l = lang.toLowerCase();
    if (l.includes('es')) return '🇪🇸';
    if (l.includes('en')) return '🇺🇸';
    return l.slice(0, 2).toUpperCase();
};

const languageLabel = (lang?: string | null) => {
    if (!lang) return '—';
    if (lang.toLowerCase() === 'es' || lang.toLowerCase() === 'spanish') return 'Español';
    if (lang.toLowerCase() === 'en' || lang.toLowerCase() === 'english') return 'English';
    return lang;
};

export const SubscribersStats: React.FC<SubscribersStatsProps> = ({
    currentPage,
    onPageChange,
    selectedLanguage,
    searchTerm = '',
}) => {
    const mapLang = (lang?: 'es' | 'en'): CampaignLanguage | undefined =>
        lang ? (lang === 'es' ? 'spanish' : 'english') : undefined;

    const { data: subscribersList, isLoading, error } = useSubscribersList(mapLang(selectedLanguage));
    const { data: totalCount }   = useSubscribersCount();
    const { data: spanishCount } = useSubscribersCount('spanish');
    const { data: englishCount } = useSubscribersCount('english');

    const limit = 10;

    const filteredSubscribers = useMemo(() => {
        const all = subscribersList?.subscribers || [];
        if (!searchTerm.trim()) return all;
        const lower = searchTerm.toLowerCase();
        return all.filter(s => {
            const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
            return name.includes(lower) || s.email.toLowerCase().includes(lower);
        });
    }, [subscribersList, searchTerm]);

    const pagedSubscribers = useMemo(() => {
        const start = (currentPage - 1) * limit;
        return filteredSubscribers.slice(start, start + limit);
    }, [filteredSubscribers, currentPage]);

    const calculatedTotalPages = useMemo(() =>
        Math.ceil(filteredSubscribers.length / limit),
    [filteredSubscribers]);

    return (
        <div className="subscribers-section">
            {/* Stat Cards */}
            <div className="nl-stats-grid">
                <div className="nl-stat-card">
                    <div className="nl-stat-card__content">
                        <div className="nl-stat-card__icon">
                            <Users size={24} strokeWidth={1.75} />
                        </div>
                        <div className="nl-stat-card__info">
                            <p className="nl-stat-card__label">Total Suscriptores</p>
                            <p className="nl-stat-card__value">{totalCount?.count ?? 0}</p>
                        </div>
                    </div>
                </div>

                <div className="nl-stat-card">
                    <div className="nl-stat-card__content">
                        <div className="nl-stat-card__icon nl-stat-card__icon--text">
                            ES
                        </div>
                        <div className="nl-stat-card__info">
                            <p className="nl-stat-card__label">Español</p>
                            <p className="nl-stat-card__value">{spanishCount?.count ?? 0}</p>
                        </div>
                    </div>
                </div>

                <div className="nl-stat-card">
                    <div className="nl-stat-card__content">
                        <div className="nl-stat-card__icon nl-stat-card__icon--text">
                            US
                        </div>
                        <div className="nl-stat-card__info">
                            <p className="nl-stat-card__label">English</p>
                            <p className="nl-stat-card__value">{englishCount?.count ?? 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Panel */}
            <div className="subscribers-panel">
                <div className="subscribers-panel__table-wrapper">
                    {isLoading ? (
                        <p className="subscribers-panel__empty">Cargando suscriptores…</p>
                    ) : error ? (
                        <p className="subscribers-panel__empty">Error al cargar suscriptores.</p>
                    ) : filteredSubscribers.length === 0 ? (
                        <p className="subscribers-panel__empty">
                            No hay suscriptores{searchTerm ? ` para "${searchTerm}"` : ''}.
                        </p>
                    ) : (
                        <table className="subscribers-table">
                            <thead>
                                <tr>
                                    <th className="subscribers-table__th">Nombre</th>
                                    <th className="subscribers-table__th">Email</th>
                                    <th className="subscribers-table__th">Idioma</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedSubscribers.map((subscriber) => {
                                    const name = subscriber.firstName || subscriber.lastName
                                        ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                                        : '—';
                                    const flag = renderFlag(subscriber.preferredLanguage);
                                    return (
                                        <tr key={subscriber.id} className="subscribers-table__row">
                                            <td className="subscribers-table__td subscribers-table__td--name">{name}</td>
                                            <td className="subscribers-table__td subscribers-table__td--email">{subscriber.email}</td>
                                            <td className="subscribers-table__td subscribers-table__td--lang">
                                                {flag && <span>{flag}</span>}
                                                <span>{languageLabel(subscriber.preferredLanguage)}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {calculatedTotalPages > 1 && (
                    <div className="subscribers-panel__pagination">
                        <button
                            className="subscribers-panel__page-btn"
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            Anterior
                        </button>
                        <span className="subscribers-panel__page-info">
                            Página {currentPage} de {calculatedTotalPages}
                        </span>
                        <button
                            className="subscribers-panel__page-btn"
                            disabled={currentPage >= calculatedTotalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
