import { ENTREPRENEURSHIP_CATEGORIES, ENTREPRENEURSHIP_APPROACHES, type Entrepreneur, type EntrepreneurUpdateData } from '../Types';
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../../config/env';
import ConfirmationModal from '../../Fairs/Components/ConfirmationModal';
import '../Styles/EditEntrepreneurForm.css';

// Definición de tipos para el contexto del archivo a reemplazar
type FileFieldName = 'url_1' | 'url_2' | 'url_3';


interface EditEntrepreneurshipDataStepProps {
  entrepreneur: Entrepreneur;
  formValues: Omit<EntrepreneurUpdateData, 'id_entrepreneur'>;
  onPrevious: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  renderField: (
    name: keyof EntrepreneurUpdateData,
    config?: any
  ) => React.ReactNode;
  form: any;
  errorMessage?: string;
  onCancel: () => void;
}

const EditEntrepreneurshipDataStep = ({
  entrepreneur,
  formValues,
  onPrevious,
  onSubmit,
  isLoading,
  renderField,
  form,
  errorMessage,
  onCancel
}: EditEntrepreneurshipDataStepProps) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const [previewCache, setPreviewCache] = useState<{ [key: string]: string }>({});
  const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: string]: boolean }>({});

  // Limpiar object URLs al desmontar el componente
  useEffect(() => {
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  // Función para convertir URL de Drive al formato proxy
const getProxyImageUrl = useCallback((url: string): string => {
  if (!url) return '';
  
  // Si es un objeto URL (archivo nuevo), devolverlo tal cual
  if (url.startsWith('blob:')) return url;
  
  // Si ya es una URL de proxy, devolverla tal cual
  if (url.includes('/images/proxy')) return url;

  // Si es una URL de Google Drive, usar el proxy
  if (url.includes('drive.google.com')) {
    return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
  }

  // Para otras URLs, devolver tal cual
  return url;
}, []);

  // Función para obtener URL de fallback
  const getFallbackUrl = useCallback((url: string): string | null => {
    if (!url || !url.includes('drive.google.com')) return null;
    
    // Extraer ID del archivo
    let fileId: string | null = null;
    const patterns = [
      /thumbnail\?id=([^&]+)/,
      /[?&]id=([^&]+)/,
      /\/d\/([^\/]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        fileId = match[1];
        break;
      }
    }
    
    if (fileId) {
      // Devolver URL de thumbnail directa como fallback
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;
    }
    
    return null;
  }, []);

  // Precalcular las previews
  useEffect(() => {
    const newPreviewCache: { [key: string]: string } = {};
    const newObjectUrls: string[] = [];

    (['url_1', 'url_2', 'url_3'] as const).forEach((fieldName) => {
      const currentValue = formValues[fieldName];
      const existingUrl = entrepreneur.entrepreneurship?.[fieldName];

      let previewUrl: string | null = null;

      if (currentValue instanceof File) {
        const objectUrl = URL.createObjectURL(currentValue);
        newObjectUrls.push(objectUrl);
        previewUrl = objectUrl;
      } else if (typeof currentValue === 'string' && currentValue.trim() !== '') {
        previewUrl = currentValue;
      } else if (existingUrl && typeof existingUrl === 'string' && existingUrl.trim() !== '') {
        previewUrl = existingUrl;
      }
      if (previewCache[fieldName] && previewUrl) {
           newPreviewCache[fieldName] = previewUrl;
      }
      else if (previewUrl) {
        newPreviewCache[fieldName] = previewUrl;
      }
    });

    setPreviewCache(newPreviewCache);
    if (newObjectUrls.length > 0) {
      setObjectUrls(prev => [...prev, ...newObjectUrls]);
    }
  }, [
    formValues.url_1,
    formValues.url_2,
    formValues.url_3,
    entrepreneur.entrepreneurship?.url_1,
    entrepreneur.entrepreneurship?.url_2,
    entrepreneur.entrepreneurship?.url_3
  ]);

  const getPreview = useCallback((fieldName: 'url_1' | 'url_2' | 'url_3'): string | null => {
    return previewCache[fieldName] || null;
  }, [previewCache]);

  
  const handleProcessFile = useCallback((fieldName: FileFieldName, file: File) => {
    
    // 1. Crear Blob URL para preview instantáneo
    const objectUrl = URL.createObjectURL(file);
    
    // 2. Actualizar form (aquí es donde se envía el File al backend)
    form.setFieldValue(fieldName, file);
    
    // 3. ACTUALIZAR CACHÉ DE PREVIEW INSTANTÁNEAMENTE
    setPreviewCache(prev => ({
        ...prev,
        [fieldName]: objectUrl,
    }));
    
    // 4. Registrar URL para limpieza
    setObjectUrls(prev => [...prev, objectUrl]);

    // 5. Limpiar el error de carga para este campo
    setImageLoadErrors(prev => ({ ...prev, [fieldName]: false }));
  }, [form]);


  const handleReplaceImage = (fieldName: 'url_1' | 'url_2' | 'url_3') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Por favor selecciona un archivo de imagen válido (JPEG, PNG, etc.)');
          return;
        }
          handleProcessFile(fieldName, file);
      }
    };
    input.click();
  };

  const renderImageField = (fieldName: 'url_1' | 'url_2' | 'url_3', idx: number) => {
    const currentValue = formValues[fieldName];
    const previewUrl = getPreview(fieldName);
    const isNewFile = currentValue instanceof File;
    const hasError = imageLoadErrors[fieldName];

    // Determinar la URL final a usar
    let finalUrl = null;
    if (previewUrl) {
      if (isNewFile) {
        // Si es un archivo nuevo, usar el blob URL directamente
        finalUrl = previewUrl;
      } else {
        // Si es una URL existente, usar el proxy
        finalUrl = getProxyImageUrl(previewUrl);
      }
    }

    return (
      <div key={fieldName} className="edit-entrepreneur-form__image-upload">
        <div className="edit-entrepreneur-form__image-upload-box">
          {finalUrl && !hasError ? (
            <div className="edit-entrepreneur-form__image-preview">
              <img
                src={finalUrl}
                alt={`Preview ${idx + 1}`}
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error(`Error loading image for ${fieldName}:`, finalUrl);
                  const target = e.currentTarget as HTMLImageElement;
                  
                  if (!target.dataset.fallbackAttempted && previewUrl) {
                    target.dataset.fallbackAttempted = 'true';
                    
                    const fallbackUrl = getFallbackUrl(previewUrl);
                    if (fallbackUrl && fallbackUrl !== finalUrl) {
                      console.log(`Trying fallback URL for ${fieldName}:`, fallbackUrl);
                      target.src = fallbackUrl;
                      return;
                    }
                  }
                  
                  setImageLoadErrors(prev => ({ ...prev, [fieldName]: true }));
                }}
                onLoad={() => {
                  setImageLoadErrors(prev => ({ ...prev, [fieldName]: false }));
                }}
              />
             <button
                type="button"
                className="edit-entrepreneur-form__image-replace-btn"
                onClick={(e) => {
                  e.preventDefault();
                  handleReplaceImage(fieldName);
                }}
                title="Reemplazar imagen"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          ) : (
            <div 
              className="edit-entrepreneur-form__image-upload-label"
              onClick={() => handleReplaceImage(fieldName)}
              style={{ cursor: 'pointer', width: '100%', height: '100%' }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={hasError ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 4v16m8-8H4"}
                />
              </svg>
              <span>
                {hasError 
                  ? 'Error - Click para reintentar' 
                  : finalUrl 
                    ? 'Click para reemplazar' 
                    : `Subir imagen ${idx + 1}`
                }
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="edit-entrepreneur-form__step-content">
      <div className="edit-entrepreneur-form__step-header">
        <div className="edit-entrepreneur-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h3 className="edit-entrepreneur-form__step-title">Información del Emprendimiento</h3>
          <p className="edit-entrepreneur-form__step-description">
            Actualiza los datos del emprendimiento. Al reemplazar imágenes, las anteriores se eliminarán de Google Drive.
          </p>
        </div>
      </div>

      <div className="edit-entrepreneur-form__fields">
        {renderField('entrepreneurship_name', {
          label: 'Nombre del Emprendimiento',
          required: true,
          placeholder: 'Nombre del emprendimiento',
          maxLength: 50,
          showCharacterCount: true,
          initialValue: entrepreneur.entrepreneurship?.name
        })}

        {renderField('description', {
          label: 'Descripción',
          required: true,
          type: 'textarea',
          placeholder: 'Describe tu emprendimiento: ¿qué haces, qué productos o servicios ofreces, a quién te diriges y qué te diferencia?',
          minLength: 80,
          maxLength: 150,
          showCharacterCount: true,
          initialValue: entrepreneur.entrepreneurship?.description
        })}

        {renderField('location', {
          label: 'Ubicación',
          required: true,
          placeholder: 'Ej: San José, Costa Rica',
          maxLength: 150,
          showCharacterCount: true,
          initialValue: entrepreneur.entrepreneurship?.location
        })}

        {renderField('category', {
          label: 'Categoría',
          required: true,
          type: 'select',
          options: ENTREPRENEURSHIP_CATEGORIES,
          initialValue: entrepreneur.entrepreneurship?.category
        })}

        {renderField('approach', {
          label: 'Enfoque',
          required: true,
          type: 'select',
          options: ENTREPRENEURSHIP_APPROACHES.map((a) => a.value),
          initialValue: entrepreneur.entrepreneurship?.approach
        })}
      </div>

      <div className="edit-entrepreneur-form__section">
        <h4 className="edit-entrepreneur-form__section-title">Imágenes del Emprendimiento</h4>
        <p className="edit-entrepreneur-form__section-description">
          Puedes ver las imágenes actuales y reemplazarlas si es necesario..
        </p>

        <div className="edit-entrepreneur-form__image-uploads">
          {renderImageField('url_1', 0)}
          {renderImageField('url_2', 1)}
          {renderImageField('url_3', 2)}
        </div>
      </div>

      {errorMessage && (
        <div className="edit-entrepreneur-form__error">
          <p style={{ whiteSpace: 'pre-line' }}>{errorMessage}</p>
        </div>
      )}

      <div className="edit-entrepreneur-form__step-actions">
        <button type="button" onClick={onCancel} className="edit-entrepreneur-form__cancel-btn">
          Cancelar
        </button>
        <div className="edit-entrepreneur-form__navigation-buttons">
          <button type="button" onClick={onPrevious} className="edit-entrepreneur-form__prev-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior: Datos Personales
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => setShowConfirmModal(true)}
            className={`edit-entrepreneur-form__submit-btn ${isLoading ? 'edit-entrepreneur-form__submit-btn--loading' : ''}`}
          >
            {isLoading ? (
              <>
                <div className="edit-entrepreneur-form__loading-spinner"></div>
                Actualizando...
              </>
            ) : (
              'Actualizar Emprendedor'
            )}
          </button>
        </div>
      </div>

      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => { setShowConfirmModal(false); onSubmit(); }}
        title="Confirmar actualización"
        message={`¿Está seguro de que desea actualizar al emprendedor "${entrepreneur.entrepreneurship?.name}"?${Object.values(form.state.values).some(val => val instanceof File)
          ? '\n\nLas imágenes reemplazadas se eliminarán permanentemente de Google Drive.'
          : ''
          }`}
        confirmText="Sí, actualizar"
        cancelText="Cancelar"
        type="info"
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditEntrepreneurshipDataStep;