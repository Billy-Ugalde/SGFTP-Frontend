import React, { useState, useRef, useEffect } from 'react';
import '../Styles/ReportModal.css';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const [selectedTrimestre, setSelectedTrimestre] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('http://localhost:3001/reports/quarterly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quarter: selectedTrimestre
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar el reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const currentYear = new Date().getFullYear();
      const quarterRoman = ['I', 'II', 'III', 'IV'][selectedTrimestre - 1];
      link.download = `Reporte de ferias ${quarterRoman} trimestre ${currentYear}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      onClose();
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar el reporte. Intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      {/* Tu contenido actual del modal aquí, pero con las clases actualizadas */}
    </div>
  );
};