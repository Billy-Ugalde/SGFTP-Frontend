// src/Modules/Informative/components/ContactInfoSection.tsx
import React, { useState, useEffect } from 'react';
import { useContactInfo, useUpdateContactInfo } from '../services/contactInfoService';
import type { ContactInfo } from '../services/contactInfoService'; 
import { validateEmail, validatePhone, validateSocialUrl } from '../utils/validations';
import '../styles/ContactInfoSection.css';

interface ContactInfoInputProps {
  label: string;
  field: keyof ContactInfo;
  type: 'text' | 'email' | 'tel' | 'url';
  value: string;
  placeholder: string;
  onChange: (field: keyof ContactInfo, value: string) => void;
  onSave: (field: keyof ContactInfo) => void;
  isLoading: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  hasChanges: boolean;
  validationError?: string | null; // ← Nuevo
  hasError?: boolean; // ← Nuevo
}

const ContactInfoInput: React.FC<ContactInfoInputProps> = ({
  label,
  field,
  type,
  value,
  placeholder,
  onChange,
  onSave,
  isLoading,
  saveStatus,
  hasChanges,
  validationError,
  hasError
}) => {
  const getButtonText = () => {
    if (isLoading) return 'Guardando...';
    if (saveStatus === 'success') return '¡Guardado!';
    if (saveStatus === 'error') return 'Error - Reintentar';
    return 'Guardar';
  };

  const getButtonClass = () => {
    let baseClass = 'admin-save-button';
    if (isLoading) baseClass += ' loading';
    if (saveStatus === 'error') baseClass += ' error';
    if (!hasChanges || hasError) baseClass += ' disabled'; 
    return baseClass;
  };

  const getInputClass = () => {
    let baseClass = 'admin-contact-input';
    if (hasError) baseClass += ' error'; 
    return baseClass;
  };

  return (
    <div className="admin-contact-info-input">
      <div className="admin-input-header">
        <label className="admin-input-label">{label}</label>
        {hasChanges && <span className="admin-changes-indicator">•</span>}
      </div>
      
      <div className="admin-input-container">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          className={getInputClass()} 
        />
        <button
          onClick={() => onSave(field)}
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
      
      {/* Mantener error genérico para errores del servidor */}
      {saveStatus === 'error' && !validationError && (
        <span className="admin-error-message">Error al guardar. Por favor intenta de nuevo.</span>
      )}
    </div>
  );
};

const ContactInfoSection: React.FC = () => {
  // Cargar data del backend
  const { data: backendData, isLoading: isLoadingData } = useContactInfo();
  const updateContactMutation = useUpdateContactInfo();

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    id_contact_info: 0,
    email: '',
    phone: '',
    address: '',
    facebook_url: '',
    instagram_url: '',
    whatsapp_url: '',
    youtube_url: '',
    google_maps_url: '',
    lastUpdated: new Date().toISOString()
  });

  const [originalData, setOriginalData] = useState<ContactInfo>(contactInfo);
  const [loadingFields, setLoadingFields] = useState<Set<keyof ContactInfo>>(new Set());
  const [saveStatuses, setSaveStatuses] = useState<Record<keyof ContactInfo, 'idle' | 'success' | 'error'>>({} as any);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ContactInfo, string | null>>>({});
  // Cargar datos iniciales del backend
  useEffect(() => {
    if (backendData) {
      setContactInfo(backendData);
      setOriginalData(backendData);
    }
  }, [backendData]);

  const handleFieldChange = (field: keyof ContactInfo, value: string) => {
    // Solo actualizar si es un campo editable (string)
    if (field !== 'id_contact_info') {
      setContactInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateField = (field: keyof ContactInfo, value: string): string | null => {
    switch (field) {
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'facebook_url':
        return validateSocialUrl(value, 'facebook');
      case 'instagram_url':
        return validateSocialUrl(value, 'instagram');
      case 'whatsapp_url':
        return validateSocialUrl(value, 'whatsapp');
      case 'youtube_url':
        return validateSocialUrl(value, 'youtube');
      case 'google_maps_url':
        return validateSocialUrl(value, 'maps');
      case 'address':
        if (!value || value.trim().length < 5) {
          return 'Dirección debe tener al menos 5 caracteres';
        }
        return null;
      default:
        return null;
    }
  };

  const handleFieldSave = async (field: keyof ContactInfo) => {
    const value = contactInfo[field];

    // === Paso 1: detección de cambios robusta (ignora espacios, y campos no editables) ===
    if (field === 'id_contact_info' || field === 'lastUpdated') return;
    const now  = String(value ?? '').trim();
    const prev = String(originalData[field] ?? '').trim();
    if (now === prev) return;
    // ================================================================================

    const stringValue = String(value);

    // Validar antes de guardar
    const validationError = validateField(field, stringValue);
    if (validationError) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: validationError
      }));
      setSaveStatuses(prev => ({ ...prev, [field]: 'error' }));
      return;
    }

    setLoadingFields(prev => new Set(prev).add(field));
    setSaveStatuses(prev => ({ ...prev, [field]: 'idle' }));
    setValidationErrors(prev => ({ ...prev, [field]: null }));

    try {
      await updateContactMutation.mutateAsync({ [field]: value });
      
      setSaveStatuses(prev => ({ ...prev, [field]: 'success' }));
      setOriginalData(prev => ({ ...prev, [field]: value }));

      // === Paso 1: refrescar "lastUpdated" local para feedback visual
      setContactInfo(prev => ({
        ...prev,
        [field]: value as any,
        lastUpdated: new Date().toISOString(),
      }));
      // =================================================================

      setTimeout(() => {
        setSaveStatuses(prev => ({ ...prev, [field]: 'idle' }));
      }, 1500);
    } catch (error) {
      setSaveStatuses(prev => ({ ...prev, [field]: 'error' }));
      setValidationErrors(prev => ({
        ...prev,
        [field]: 'Error al guardar. Por favor intenta de nuevo.'
      }));
      console.error('Error saving contact info:', error);
    } finally {
      setLoadingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  const hasFieldChanges = (field: keyof ContactInfo) => {
    // === Paso 1: Solo comparar strings limpios y evitar campos no editables
    if (field === 'id_contact_info' || field === 'lastUpdated') return false;
    const now  = String(contactInfo[field] ?? '').trim();
    const prev = String(originalData[field] ?? '').trim();
    return now !== prev;
    // ===================================================================
  };

  const hasFieldError = (field: keyof ContactInfo) => {
    return !!validationErrors[field];
  };

  if (isLoadingData) {
    return <div className="admin-loading-state">Cargando información de contacto...</div>;
  }

  return (
    <div className="admin-contact-info-section">
      {/* Basic Contact Info */}
      <div className="admin-contact-group">
        <h4>Información de Contacto Básica</h4>
        
        <ContactInfoInput
          label="Correo Electrónico"
          field="email"
          type="email"
          value={contactInfo.email}
          placeholder="contacto@organizacion.com"
          onChange={handleFieldChange}
          onSave={handleFieldSave}
          isLoading={loadingFields.has('email')}
          saveStatus={saveStatuses.email || 'idle'}
          hasChanges={hasFieldChanges('email')}
          validationError={validationErrors.email}
          hasError={hasFieldError('email')}
        />

        <ContactInfoInput
          label="Número de Teléfono"
          field="phone"
          type="tel"
          value={contactInfo.phone}
          placeholder="+506 1234 5678"
          onChange={handleFieldChange}
          onSave={handleFieldSave}
          isLoading={loadingFields.has('phone')}
          saveStatus={saveStatuses.phone || 'idle'}
          hasChanges={hasFieldChanges('phone')}
          validationError={validationErrors.phone}
          hasError={hasFieldError('phone')}
        />

        <ContactInfoInput
          label="Dirección"
          field="address"
          type="text"
          value={contactInfo.address}
          placeholder="Dirección completa de la organización"
          onChange={handleFieldChange}
          onSave={handleFieldSave}
          isLoading={loadingFields.has('address')}
          saveStatus={saveStatuses.address || 'idle'}
          hasChanges={hasFieldChanges('address')}
          validationError={validationErrors.address}
          hasError={hasFieldError('address')}
        />
      </div>

      {/* Social Media Links */}
      <div className="admin-contact-group">
        <h4>Redes Sociales y Enlaces Externos</h4>
        
        <ContactInfoInput
          label="URL de Facebook"
          field="facebook_url"
          type="url"
          value={contactInfo.facebook_url}
          placeholder="https://www.facebook.com/tupagina"
          onChange={handleFieldChange}
          onSave={handleFieldSave}
          isLoading={loadingFields.has('facebook_url')}
          saveStatus={saveStatuses.facebook_url || 'idle'}
          hasChanges={hasFieldChanges('facebook_url')}
          validationError={validationErrors.facebook_url}
          hasError={hasFieldError('facebook_url')}
        />

        <ContactInfoInput
          label="URL de Instagram"
          field="instagram_url"
          type="url"
          value={contactInfo.instagram_url}
          placeholder="https://www.instagram.com/tuusuario"
          onChange={handleFieldChange}
          onSave={handleFieldSave}
          isLoading={loadingFields.has('instagram_url')}
          saveStatus={saveStatuses.instagram_url || 'idle'}
          hasChanges={hasFieldChanges('instagram_url')}
          validationError={validationErrors.instagram_url}
          hasError={hasFieldError('instagram_url')}
        />

        <ContactInfoInput
          label="URL de WhatsApp"
          field="whatsapp_url"
          type="url"
          value={contactInfo.whatsapp_url}
          placeholder="https://api.whatsapp.com/send?phone=506..."
          onChange={handleFieldChange}
          onSave={handleFieldSave}
          isLoading={loadingFields.has('whatsapp_url')}
          saveStatus={saveStatuses.whatsapp_url || 'idle'}
          hasChanges={hasFieldChanges('whatsapp_url')}
          validationError={validationErrors.whatsapp_url}
          hasError={hasFieldError('whatsapp_url')}
        />

        <ContactInfoInput
          label="URL de YouTube"
          field="youtube_url"
          type="url"
          value={contactInfo.youtube_url}
          placeholder="https://www.youtube.com/@tucanal"
          onChange={handleFieldChange}
          onSave={handleFieldSave}
          isLoading={loadingFields.has('youtube_url')}
          saveStatus={saveStatuses.youtube_url || 'idle'}
          hasChanges={hasFieldChanges('youtube_url')}
          validationError={validationErrors.youtube_url}
          hasError={hasFieldError('youtube_url')}
        />

        <ContactInfoInput
          label="URL de Google Maps"
          field="google_maps_url"
          type="url"
          value={contactInfo.google_maps_url}
          placeholder="https://maps.google.com/..."
          onChange={handleFieldChange}
          onSave={handleFieldSave}
          isLoading={loadingFields.has('google_maps_url')}
          saveStatus={saveStatuses.google_maps_url || 'idle'}
          hasChanges={hasFieldChanges('google_maps_url')}
          validationError={validationErrors.google_maps_url}
          hasError={hasFieldError('google_maps_url')}
        />
      </div>

      {/* Last Updated Info */}
      <div className="admin-last-updated">
        <small>Última actualización: {new Date(contactInfo.lastUpdated).toLocaleString('es-ES')}</small>
      </div>
    </div>
  );
};

export default ContactInfoSection;
