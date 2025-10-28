import React, { useState } from 'react';
import { SendCampaignButton } from '../Components/SendCampaignButton';
import { CampaignsList } from '../Components/CampaignsList';
import { SubscribersStats } from '../Components/SubscribersStats';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import '../Styles/NewsletterPage.css';

const NewsletterPage: React.FC = () => {
    const [campaignPage, setCampaignPage] = useState(1);
    const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en' | undefined>(undefined);
    const [subscriberPage, setSubscriberPage] = useState(1);

    return (
        <div className="page-container">
            <div className="page__header">
                <div className="page__header-container">
                    <div className="page__title-container">
                        <div className="page__title-icon"><span>📧</span></div>
                        <div>
                            <h1 className="page__title">Newsletters</h1>
                            <p className="page__description">
                                Gestiona el envío de newsletters a los suscriptores del sistema.
                                Envía campañas en español o inglés y revisa el historial de envíos.
                            </p>
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <BackToDashboardButton />
                        </div>
                    </div>
                </div>
            </div>

            <div className="page__main">
                <div className="action-bar">
                    <div className="action-bar__content"><SendCampaignButton /></div>
                </div>

                <div className="newsletter-content">
                    <div className="newsletter-content__left">
                        <SubscribersStats
                            currentPage={subscriberPage}
                            totalPages={0}
                            onPageChange={setSubscriberPage}
                            selectedLanguage={selectedLanguage}
                            setSelectedLanguage={setSelectedLanguage}
                        />
                    </div>

                    <div className="newsletter-content__right">
                        <CampaignsList
                            currentPage={campaignPage}
                            onPageChange={setCampaignPage}
                        />
                    </div>
                </div>
            </div>
            <div className="page__footer">
                <div className="page__footer-container">
                    <div className="page__footer-content">
                        <span>Fundación Tamarindo Park</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsletterPage;