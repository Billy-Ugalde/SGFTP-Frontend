import React, { useState } from 'react';
import { useStandsByFair } from '../Services/FairsServices';
import '../Styles/StandsSelector.css';

interface Stand {
  id_stand: number;
  stand_code: string;
  status: boolean; 
}

interface StandsSelectorProps {
  capacity: number;
  onCapacityChange: (newCapacity: number) => void;
  fairId?: number;
  typeFair: string;
  disabled?: boolean;
}

const StandsSelector: React.FC<StandsSelectorProps> = ({ 
  capacity, 
  onCapacityChange, 
  fairId,
  typeFair,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: backendStands, isLoading} = useStandsByFair(fairId || 0);
  const isEditing = !!fairId;
  const isInternal = typeFair === 'interna';

  const generateStands = (count: number): Stand[] => {
    const stands: Stand[] = [];
    for (let i = 0; i < count; i++) {
      const letter = String.fromCharCode(65 + Math.floor(i / 10));
      const number = (i % 10) + 1;
      const code = `${letter}${number.toString().padStart(2, '0')}`;
      
      stands.push({
        id_stand: i,
        stand_code: code,
        status: false
      });
    }
    return stands;
  };

  const currentStands = (() => {
    if (!isEditing) {
      return generateStands(capacity);
    }
    
    if (backendStands && backendStands.length > 0) {
      if (capacity !== backendStands.length) {
        if (capacity > backendStands.length) {
          const additionalStands = generateStands(capacity - backendStands.length);
          const adjustedAdditional = additionalStands.map((stand, index) => ({
            ...stand,
            id_stand: backendStands.length + index,
            stand_code: (() => {
              const position = backendStands.length + index;
              const letter = String.fromCharCode(65 + Math.floor(position / 10));
              const number = (position % 10) + 1;
              return `${letter}${number.toString().padStart(2, '0')}`;
            })()
          }));
          return [...backendStands, ...adjustedAdditional];
        } else {
          return backendStands.slice(0, capacity);
        }
      }
      return backendStands;
    }
    
    return generateStands(capacity);
  })();

  const handleCapacityChange = (newCapacity: number) => {
    if (!isEditing && newCapacity < 1) newCapacity = 1; 
    if (isEditing && newCapacity < 0) newCapacity = 0;
    onCapacityChange(newCapacity);
  };

  const getStandsPerRow = (totalStands: number) => {
    if (totalStands <= 10) return 5;
    if (totalStands <= 30) return 10;
    if (totalStands <= 60) return 12;
    return 15;
  };

  const standsPerRow = getStandsPerRow(currentStands.length);
  const availableCount = currentStands.filter(stand => !stand.status).length;
  const occupiedCount = currentStands.filter(stand => stand.status).length;

  // Para ferias externas, mostrar solo el número
  if (!isInternal) {
    return (
      <div className="stands-selector">
        <div className="stands-selector__trigger-container">
          <label className="stands-selector__label">
            Configuración de Stands <span className="stands-selector__required">*</span>
          </label>
          
          <div className="stands-selector__external-container">
            <div className="stands-selector__external-info">
              <div className="stands-selector__external-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="stands-selector__external-content">
                <h3 className="stands-selector__external-title">Feria Externa</h3>
                <p className="stands-selector__external-description">
                  Para ferias externas solo se define el número total de stands disponibles
                </p>
              </div>
            </div>
            
            <div className="stands-selector__external-input-group">
              <label className="stands-selector__capacity-label">
                Número de Stands
              </label>
              
              <div className="stands-selector__capacity-inputs">
                <input
                  type="range"
                  min={isEditing ? 0 : 1}
                  max="100"
                  value={capacity}
                  onChange={(e) => handleCapacityChange(parseInt(e.target.value))}
                  className="stands-selector__range"
                  disabled={disabled}
                />
                <input
                  type="number"
                  min={isEditing ? 0 : 1}
                  max="100"
                  value={capacity}
                  onChange={(e) => handleCapacityChange(parseInt(e.target.value))}
                  className="stands-selector__number-input"
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="stands-selector__external-summary">
              <span className="stands-selector__external-count">
                <strong>{capacity}</strong> stands configurados para la feria externa
              </span>
              {isEditing && (
                <div className="stands-selector__external-stats">
                  <span className="stands-selector__stat stands-selector__stat--available">
                    <strong>{availableCount}</strong> disponibles
                  </span>
                  <span className="stands-selector__stat stands-selector__stat--occupied">
                    <strong>{occupiedCount}</strong> ocupados
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="stands-selector">
      <div className="stands-selector__trigger-container">
        <label className="stands-selector__label">
          Configuración de Stands <span className="stands-selector__required">*</span>
        </label>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`stands-selector__trigger ${disabled ? 'stands-selector__trigger--disabled' : ''}`}
        >
          <div className="stands-selector__trigger-content">
            <div className="stands-selector__trigger-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="stands-selector__trigger-text">
              {currentStands.length} stands configurados (Feria Interna)
              {isEditing && (
                <span className="stands-selector__trigger-status">
                  ({availableCount} disponibles, {occupiedCount} ocupados)
                </span>
              )}
            </span>
          </div>
          
          <div className={`stands-selector__trigger-arrow ${isOpen ? 'stands-selector__trigger-arrow--open' : ''}`}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="stands-selector__panel">
          <div className="stands-selector__capacity-control">
            <label className="stands-selector__capacity-label">
              {isEditing ? 'Ajustar Stands' : 'Número de Stands'}
            </label>
            
            <div className="stands-selector__capacity-inputs">
              <input
                type="range"
                min={isEditing ? 0 : 1}
                max="100"
                value={capacity}
                onChange={(e) => handleCapacityChange(parseInt(e.target.value))}
                className="stands-selector__range"
              />
              <input
                type="number"
                min={isEditing ? 0 : 1}
                max="100"
                value={capacity}
                onChange={(e) => handleCapacityChange(parseInt(e.target.value))}
                className="stands-selector__number-input"
              />
            </div>
          </div>

          <div className="stands-selector__legend">
            <div className="stands-selector__legend-item">
              <div className="stands-selector__legend-color stands-selector__legend-color--available"></div>
              <span className="stands-selector__legend-text">Disponible</span>
            </div>

            {isEditing && (
              <div className="stands-selector__legend-item">
                <div className="stands-selector__legend-color stands-selector__legend-color--occupied"></div>
                <span className="stands-selector__legend-text">Ocupado</span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="stands-selector__loading">
              <svg className="stands-selector__loading-spinner" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando stands...
            </div>
          ) : (
            <>
              <div className="stands-selector__grid-container">
                <div 
                  className="stands-selector__grid"
                  style={{ 
                    gridTemplateColumns: `repeat(${standsPerRow}, 1fr)`,
                    gap: currentStands.length > 30 ? '0.25rem' : '0.5rem'
                  }}
                >
                  {currentStands.map((stand) => {
                    const isAvailable = !stand.status;
                    
                    return (
                      <div
                        key={stand.id_stand}
                        className={`stands-selector__stand ${
                          isAvailable 
                            ? 'stands-selector__stand--available' 
                            : 'stands-selector__stand--occupied'
                        } ${
                          currentStands.length > 50 
                            ? 'stands-selector__stand--small' 
                            : ''
                        }`}
                        title={`Stand ${stand.stand_code} - ${isAvailable ? 'Disponible' : 'Ocupado'}`}
                      >
                        {stand.stand_code}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="stands-selector__stats">
                {!isEditing ? (
                  <span className="stands-selector__stat stands-selector__stat--total">
                    Total: <strong>{currentStands.length}</strong> stands
                  </span>
                ) : (
                  <>
                    <div className="stands-selector__stats-left">
                      <span className="stands-selector__stat stands-selector__stat--available">
                        <strong>{availableCount}</strong> disponibles
                      </span>
                      <span className="stands-selector__stat stands-selector__stat--occupied">
                        <strong>{occupiedCount}</strong> ocupados
                      </span>
                    </div>
                    <span className="stands-selector__stat stands-selector__stat--total">
                      Total: <strong>{currentStands.length}</strong> stands
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StandsSelector;