import type { ReactNode } from 'react';
import '../styles/StatCards.css';

export type StatVariant = 'total' | 'active' | 'inactive' | 'warning' | 'purple';

export interface StatCardItem {
  icon: ReactNode;
  label: string;
  value: number | string;
  variant: StatVariant;
}

interface StatCardsProps {
  stats: StatCardItem[];
}

const StatCards = ({ stats }: StatCardsProps) => (
  <div className="stat-cards">
    {stats.map((stat, i) => (
      <div key={i} className="stat-cards__card">
        <div className="stat-cards__content">
          <div className={`stat-cards__icon stat-cards__icon--${stat.variant}`}>
            {stat.icon}
          </div>
          <div>
            <p className="stat-cards__label">{stat.label}</p>
            <p className={`stat-cards__value stat-cards__value--${stat.variant}`}>{stat.value}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default StatCards;
