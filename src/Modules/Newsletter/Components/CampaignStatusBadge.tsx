import React from 'react';
import type { CampaignStatus } from '../types/newsletter.types';

const getClass = (status: CampaignStatus): string => {
    switch (status) {
        case 'completed': return 'badge--published';
        case 'failed':    return 'badge--archived';
        case 'partial':   return 'badge--draft';
        default:          return 'badge--draft';
    }
};

const getText = (status: CampaignStatus): string => {
    switch (status) {
        case 'completed': return 'Completado';
        case 'failed':    return 'Fallido';
        case 'partial':   return 'Parcial';
        default:          return status;
    }
};

interface CampaignStatusBadgeProps {
    status: CampaignStatus;
}

const CampaignStatusBadge: React.FC<CampaignStatusBadgeProps> = ({ status }) => (
    <span className={`nl-badge ${getClass(status)}`}>
        {getText(status)}
    </span>
);

export default CampaignStatusBadge;
