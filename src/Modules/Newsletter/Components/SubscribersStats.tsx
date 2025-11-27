import React, { useMemo } from 'react';
import { useSubscribersCount, useSubscribersList } from '../Services/NewsletterService';
import type { CampaignLanguage } from '../types/newsletter.types';
import '../Styles/SubscribersStats.css';

interface SubscribersStatsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    selectedLanguage?: 'es' | 'en';
    setSelectedLanguage?: (lang?: 'es' | 'en') => void;
}

const renderFlag = (lang?: string | null) => {
    if (!lang) return null;
    const l = lang.toLowerCase();
    if (l.includes('es')) return '🇪🇸';
    if (l.includes('en')) return '🇺🇸';
    return l.slice(0, 2).toUpperCase();
};

const languageLabel = (lang?: string) => {
    if (!lang) return '';
    if (lang.toLowerCase() === 'es') return 'Español';
    if (lang.toLowerCase() === 'en') return 'English';
    return lang;
};

export const SubscribersStats: React.FC<SubscribersStatsProps> = ({
    currentPage,

    onPageChange,
    selectedLanguage,
    setSelectedLanguage,
}) => {
    const mapLangToCampaignLanguage = (lang?: 'es' | 'en'): CampaignLanguage | undefined => {
        if (!lang) return undefined;
        return lang === 'es' ? 'spanish' : 'english';
    };

    const { data: subscribersList, isLoading, error } = useSubscribersList(mapLangToCampaignLanguage(selectedLanguage));
    const { data: totalCount } = useSubscribersCount();
    const { data: spanishCount } = useSubscribersCount('spanish');
    const { data: englishCount } = useSubscribersCount('english');

    const limit = 10;
    const pagedSubscribers = useMemo(() => {
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return subscribersList?.subscribers?.slice(startIndex, endIndex) || [];
    }, [subscribersList, currentPage]);

    const calculatedTotalPages = useMemo(() => {
        return Math.ceil((subscribersList?.subscribers?.length || 0) / limit);
    }, [subscribersList]);

    return (
        <div className="subscribers-stats">
            <div className="subscribers-stats__header">
                <h3>Suscriptores</h3>
            </div>

            <div className="stats-grid">
                <div>Total: {totalCount?.count || 0}</div>
                <div>Español: {spanishCount?.count || 0}</div>
                <div>English: {englishCount?.count || 0}</div>
            </div>

            {setSelectedLanguage && (
                <div className="language-filter">
                    <label htmlFor="languageFilter">Filtrar por idioma:</label>
                    <select
                        id="languageFilter"
                        value={selectedLanguage || ''}
                        onChange={(e) => {
                            setSelectedLanguage(e.target.value ? (e.target.value as 'es' | 'en') : undefined);
                            onPageChange(1);
                        }}
                    >
                        <option value="">Todos los idiomas</option>
                        <option value="es">Español</option>
                        <option value="en">English</option>
                    </select>
                </div>
            )}

            {isLoading ? (
                <p>Cargando suscriptores…</p>
            ) : error ? (
                <p>Error al cargar suscriptores</p>
            ) : pagedSubscribers.length > 0 ? (
                <div className="subscribers-list">
                    {pagedSubscribers.map((subscriber) => {
                        const name = subscriber.firstName || subscriber.lastName
                            ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                            : null;
                        const flag = renderFlag(subscriber.preferredLanguage);
                        return (
                            <div key={subscriber.id} className="subscriber-item">
                                <div className="subscriber-info">
                                    {name && <div className="subscriber-name">{name}</div>}
                                    <div className="subscriber-email">{subscriber.email}</div>
                                </div>
                                {flag && (
                                    <span className="subscriber-language" title={subscriber.preferredLanguage}>
                                        {flag}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p>No hay suscriptores {selectedLanguage ? `en ${languageLabel(selectedLanguage)}` : ''}.</p>
            )}

            {calculatedTotalPages > 1 && (
                <div className="subscribers-pagination">
                    <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
                        Anterior
                    </button>
                    <span>Página {currentPage} de {calculatedTotalPages}</span>
                    <button disabled={currentPage >= calculatedTotalPages} onClick={() => onPageChange(currentPage + 1)}>
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};