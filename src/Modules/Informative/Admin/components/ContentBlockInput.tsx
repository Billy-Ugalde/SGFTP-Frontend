// src/Modules/Informative/components/ContentBlockInput.tsx
import React, { useState, useEffect } from 'react';
import { useUpdateContentBlock } from '../services/contentBlockService';
import { validateTextContent, validateImageUrl, TEXT_LIMITS } from '../utils/validations';
import '../styles/ContentBlockInput.css';

interface ContentBlockInputProps {
  label: string;
  page: string;
  section: string;
  blockKey: string;
  type: 'text' | 'textarea' | 'image';
  initialValue?: string;
  placeholder?: string;
  onSave?: (value: string) => void;
}

const ContentBlockInput: React.FC<ContentBlockInputProps> = ({
  label,
  page,
  section,
  blockKey,
  type,
  initialValue = '',
  placeholder = '',
  onSave
}) => {
  const [value, setValue] = useState(initialValue);
  const [originalValue, setOriginalValue] = useState(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const updateContentMutation = useUpdateContentBlock();

  useEffect(() => {
    setValue(initialValue);
    setOriginalValue(initialValue);
  }, [initialValue]);

  const hasChanges = value !== originalValue;
  const hasError = !!validationError;
  const isLoading = updateContentMutation.isPending;

  // Estados del botón basados en el estado de la mutación
  const saveStatus = (() => {
    if (updateContentMutation.isPending) return 'loading';
    if (updateContentMutation.isSuccess) return 'success';
    if (updateContentMutation.isError || hasError) return 'error';
    return 'idle';
  })();

  const validateField = (inputValue: string): string | null => {
    if (type === 'image') {
      return validateImageUrl(inputValue);
    } else {
      return validateTextContent(inputValue, blockKey);
    }
  };

  const handleSave = async () => {
    if (!hasChanges || isLoading || hasError) return;

    // Validar antes de guardar
    const error = validateField(value);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      const updateData = type === 'image' 
        ? { image_url: value }
        : { text_content: value };

      await updateContentMutation.mutateAsync({
        page,
        section,
        blockKey,
        data: updateData
      });

      // Si llegamos aquí, el guardado fue exitoso
      setOriginalValue(value);
      setValidationError(null);
      onSave?.(value);

      // Reset success status after 2 seconds
      setTimeout(() => {
        updateContentMutation.reset();
      }, 2000);

    } catch (error) {
      console.error('Error saving content block:', error);
      setValidationError('Error al guardar. Por favor intenta de nuevo.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }

    // Reset mutation state if it was in error/success
    if (updateContentMutation.isError || updateContentMutation.isSuccess) {
      updateContentMutation.reset();
    }
  };

  const renderInput = () => {
    const commonProps = {
      value,
      onChange: handleChange,
      placeholder,
      className: `admin-content-input${hasError ? ' error' : ''}`
    };

    switch (type) {
      case 'textarea':
        return <textarea {...commonProps} rows={4} />;
      case 'image':
        return <input {...commonProps} type="url" />;
      default:
        return <input {...commonProps} type="text" />;
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Guardando...';
    if (saveStatus === 'success') return '¡Guardado!';
    if (saveStatus === 'error') return 'Error - Reintentar';
    return 'Guardar';
  };

  const getButtonClass = () => {
    let baseClass = 'admin-save-button';
    if (isLoading) baseClass += ' admin-loading';
    if (saveStatus === 'success') baseClass += ' admin-success';
    if (saveStatus === 'error') baseClass += ' admin-error';
    if (!hasChanges || hasError) baseClass += ' admin-disabled';
    return baseClass;
  };

  // Obtener límites de caracteres para mostrar contador
  const getCharacterLimits = () => {
    if (type === 'image') return null;
    return TEXT_LIMITS[blockKey as keyof typeof TEXT_LIMITS];
  };

  const characterLimits = getCharacterLimits();
  const currentLength = value.trim().length;

  return (
    <div className="admin-content-block-input">
      <div className="admin-input-header">
        <label className="admin-input-label">{label}</label>
        <div className="admin-input-indicators">
          {hasChanges && <span className="admin-changes-indicator">•</span>}
          {characterLimits && (
            <span className={`admin-character-count ${currentLength > characterLimits.max ? 'admin-over-limit' : ''}`}>
              {currentLength}/{characterLimits.max}
            </span>
          )}
        </div>
      </div>
      
      <div className="admin-input-container">
        {renderInput()}
        <button
          onClick={handleSave}
          disabled={!hasChanges || isLoading || hasError}
          className={getButtonClass()}
        >
          {getButtonText()}
        </button>
      </div>
      
      {/* Mostrar error de validación */}
      {validationError && (
        <span className="admin-error-message validation-error">{validationError}</span>
      )}
      
      {/* Mostrar límites de caracteres si están cerca del límite */}
      {characterLimits && currentLength >= characterLimits.max * 0.8 && (
        <span className="admin-character-warning">
          {currentLength < characterLimits.max 
            ? `Quedan ${characterLimits.max - currentLength} caracteres`
            : `Excede por ${currentLength - characterLimits.max} caracteres`
          }
        </span>
      )}
    </div>
  );
};

export default ContentBlockInput;