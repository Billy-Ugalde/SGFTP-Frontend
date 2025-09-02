// src/Modules/Informative/components/SectionContainer.tsx
import React, { useState } from 'react';
import '../styles/SectionContainer.css';

interface SectionContainerProps {
  title: string;
  section: string;
  page: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const SectionContainer: React.FC<SectionContainerProps> = ({
  title,
  children,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`admin-section-container ${isExpanded ? 'admin-expanded' : ''}`}>
      <div className="admin-section-header" onClick={toggleExpanded}>
        <h3 className="admin-section-title">{title}</h3>
        <span className={`admin-expand-icon ${isExpanded ? 'admin-expanded' : ''}`}>
          ▼
        </span>
      </div>
      
      {isExpanded && (
        <div className="admin-section-body">
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionContainer;