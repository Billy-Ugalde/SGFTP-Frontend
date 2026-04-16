import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { SendCampaignButton } from '../Components/SendCampaignButton';
import { CampaignsList } from '../Components/CampaignsList';
import { SubscribersStats } from '../Components/SubscribersStats';
import LanguageFilter from '../Components/LanguageFilter';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import '../Styles/NewsletterPage.css';

const NewsletterPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'subscribers' | 'history'>('subscribers');
    const [campaignPage, setCampaignPage] = useState(1);
    const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'es' | 'en'>('all');
    const [subscriberPage, setSubscriberPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const handleTabChange = (tab: 'subscribers' | 'history') => {
        setActiveTab(tab);
        setSearchTerm('');
    };

    const handleLanguageChange = (lang: 'all' | 'es' | 'en') => {
        setSelectedLanguage(lang);
        setSubscriberPage(1);
    };

    return (
        <div className="newsletter-dashboard">
            {/* Compact Header */}
            <div className="newsletter-dashboard__header">
                <div className="newsletter-dashboard__header-inner">
                    <div className="newsletter-dashboard__header-left">
                        <div className="newsletter-dashboard__header-icon">
                            <Mail size={18} strokeWidth={2} />
                        </div>
                        <h1 className="newsletter-dashboard__title">Gestión de Newsletters</h1>
                    </div>
                    <BackToDashboardButton />
                </div>
            </div>

            {/* Main Content */}
            <div className="newsletter-dashboard__main">
                {/* Action Bar */}
                <div className="newsletter-dashboard__action-bar">
                    {/* Tab Buttons */}
                    <div className="newsletter-dashboard__tabs">
                        <button
                            onClick={() => handleTabChange('subscribers')}
                            className={`newsletter-dashboard__tab ${activeTab === 'subscribers' ? 'newsletter-dashboard__tab--active' : ''}`}
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Suscriptores
                        </button>
                        <button
                            onClick={() => handleTabChange('history')}
                            className={`newsletter-dashboard__tab ${activeTab === 'history' ? 'newsletter-dashboard__tab--active' : ''}`}
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Historial
                        </button>
                    </div>

                    {/* Controls Row */}
                    <div className="newsletter-dashboard__controls-row">
                        {activeTab === 'subscribers' && (
                            <LanguageFilter
                                value={selectedLanguage}
                                onChange={handleLanguageChange}
                            />
                        )}

                        <div className="newsletter-dashboard__search-wrapper">
                            <div className="newsletter-dashboard__search-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder={activeTab === 'subscribers' ? 'Buscar suscriptores...' : 'Buscar newsletters...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="newsletter-dashboard__search-input"
                            />
                        </div>

                        <SendCampaignButton />
                    </div>
                </div>

                {/* Content based on active tab */}
                {activeTab === 'subscribers' ? (
                    <SubscribersStats
                        currentPage={subscriberPage}
                        totalPages={0}
                        onPageChange={setSubscriberPage}
                        selectedLanguage={selectedLanguage === 'all' ? undefined : selectedLanguage}
                        searchTerm={searchTerm}
                    />
                ) : (
                    <CampaignsList
                        currentPage={campaignPage}
                        onPageChange={setCampaignPage}
                        searchTerm={searchTerm}
                    />
                )}
            </div>
        </div>
    );
};

export default NewsletterPage;
