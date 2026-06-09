import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import { useSubscribersCount, useSubscribersList } from '../Services/NewsletterService';
import type { CampaignLanguage } from '../types/newsletter.types';
import { ListState } from '../../Shared/components';
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

    const { data: subscribersList, isLoading, error, refetch } = useSubscribersList(mapLang(selectedLanguage));
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

    const handlePageChange = (page: number) => {
        onPageChange(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getPageNumbers = () => {
        const pages: number[] = [];
        if (calculatedTotalPages <= 5) {
            for (let i = 1; i <= calculatedTotalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 5; i++) pages.push(i);
        } else if (currentPage >= calculatedTotalPages - 2) {
            for (let i = calculatedTotalPages - 4; i <= calculatedTotalPages; i++) pages.push(i);
        } else {
            for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className="subscribers-section">
            {/* Stat Cards */}
            <div className="nl-stats-grid">
                <div className="nl-stat-card">
                    <div className="nl-stat-card__content">
                        <div className="nl-stat-card__icon nl-stat-card__icon--total">
                            <Users size={24} strokeWidth={1.75} />
                        </div>
                        <div className="nl-stat-card__info">
                            <p className="nl-stat-card__label">Total Suscriptores</p>
                            <p className="nl-stat-card__value nl-stat-card__value--total">{totalCount?.count ?? 0}</p>
                        </div>
                    </div>
                </div>

                <div className="nl-stat-card">
                    <div className="nl-stat-card__content">
                        <div className="nl-stat-card__icon nl-stat-card__icon--spanish nl-stat-card__icon--text">
                            ES
                        </div>
                        <div className="nl-stat-card__info">
                            <p className="nl-stat-card__label">Español</p>
                            <p className="nl-stat-card__value nl-stat-card__value--spanish">{spanishCount?.count ?? 0}</p>
                        </div>
                    </div>
                </div>

                <div className="nl-stat-card">
                    <div className="nl-stat-card__content">
                        <div className="nl-stat-card__icon nl-stat-card__icon--english nl-stat-card__icon--text">
                            EN
                        </div>
                        <div className="nl-stat-card__info">
                            <p className="nl-stat-card__label">English</p>
                            <p className="nl-stat-card__value nl-stat-card__value--english">{englishCount?.count ?? 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Panel */}
            <div className="subscribers-panel">
                <div className="subscribers-panel__table-wrapper">
                    {isLoading || error ? (
                        <ListState
                            isLoading={isLoading}
                            error={error}
                            loadingText="Cargando suscriptores..."
                            errorTitle="No se pudieron cargar los suscriptores"
                            errorDescription="Hubo un problema al obtener la informacion. Verifica tu conexion e intentalo nuevamente."
                            onRetry={refetch}
                        />
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
                                            <td className="subscribers-table__td subscribers-table__td--name" data-label="Nombre">
                                                <span className="subscribers-table__name-text">{name}</span>
                                            </td>
                                            <td className="subscribers-table__td subscribers-table__td--email" data-label="Email">{subscriber.email}</td>
                                            <td className="subscribers-table__td subscribers-table__td--lang" data-label="Idioma">
                                                {flag ? `${flag} ${languageLabel(subscriber.preferredLanguage)}` : languageLabel(subscriber.preferredLanguage)}
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
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Anterior
                        </button>

                        <div className="subscribers-panel__pagination-numbers">
                            {currentPage > 3 && calculatedTotalPages > 5 && (
                                <>
                                    <button onClick={() => handlePageChange(1)} className="subscribers-panel__page-num">1</button>
                                    <span className="subscribers-panel__page-ellipsis">...</span>
                                </>
                            )}
                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`subscribers-panel__page-num ${currentPage === page ? 'subscribers-panel__page-num--active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                            {currentPage < calculatedTotalPages - 2 && calculatedTotalPages > 5 && (
                                <>
                                    <span className="subscribers-panel__page-ellipsis">...</span>
                                    <button onClick={() => handlePageChange(calculatedTotalPages)} className="subscribers-panel__page-num">{calculatedTotalPages}</button>
                                </>
                            )}
                        </div>

                        <button
                            className="subscribers-panel__page-btn"
                            disabled={currentPage >= calculatedTotalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Siguiente
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <span className="subscribers-panel__page-info">
                            {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, filteredSubscribers.length)} de {filteredSubscribers.length}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
