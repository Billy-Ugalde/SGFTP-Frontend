import { ENTREPRENEURSHIP_CATEGORIES, ENTREPRENEURSHIP_APPROACHES } from '../Services/EntrepreneursServices';
import type { Entrepreneur, EntrepreneurUpdateData } from '../Services/EntrepreneursServices';
import { useState, useEffect, useCallback } from 'react';
import ConfirmationModal from '../../Fairs/Components/ConfirmationModal';
import '../Styles/EditEntrepreneurForm.css';

interface EditEntrepreneurshipDataStepProps {
  entrepreneur: Entrepreneur;
  formValues: Omit<EntrepreneurUpdateData, 'id_entrepreneur'>;
  onPrevious: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  renderField: (
    name: keyof EntrepreneurUpdateData | 'phones[0].number' | 'phones[1].number',
    config?: any
  ) => React.ReactNode;
  form: any;
}

const EditEntrepreneurshipDataStep = ({
  entrepreneur,
  formValues,
  onPrevious,
  onSubmit,
  isLoading,
  renderField,
  form
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
    // Simplemente usar localhost directamente para desarrollo
    const baseUrl = 'http://localhost:3001';
    return `${baseUrl}/images/proxy?url=${encodeURIComponent(url)}`;
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

      if (previewUrl) {
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

        const existingImage = entrepreneur.entrepreneurship?.[fieldName];
        if (existingImage && typeof existingImage === 'string' && existingImage.trim() !== '') {
          if (!confirm('¿Estás seguro de que quieres reemplazar esta imagen? La imagen anterior se eliminará permanentemente de Google Drive.')) {
            return;
          }
        }

        form.setFieldValue(fieldName, file);
        // Limpiar el error de carga para este campo
        setImageLoadErrors(prev => ({ ...prev, [fieldName]: false }));
      }
    };
    input.click();
  };

  const renderImageField = (fieldName: 'url_1' | 'url_2' | 'url_3', label: string) => {
    const currentValue = formValues[fieldName];
    const existingUrl = entrepreneur.entrepreneurship?.[fieldName];
    const previewUrl = getPreview(fieldName);
    const hasExistingImage = existingUrl && typeof existingUrl === 'string' && existingUrl.trim() !== '';
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
      <div className="edit-entrepreneur-form__image-field">
        <label className="edit-entrepreneur-form__label">
          {label}
          {!previewUrl && <span className="edit-entrepreneur-form__optional"> (Opcional)</span>}
        </label>

        <div className="edit-entrepreneur-form__preview-wrapper">
          {finalUrl && !hasError ? (
            <>
              <img
                src={finalUrl}
                alt={`Preview ${label}`}
                className="edit-entrepreneur-form__preview"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error(`Error loading image for ${fieldName}:`, finalUrl);
                  const target = e.currentTarget as HTMLImageElement;
                  
                  // Intentar con fallback si no lo hemos intentado aún
                  if (!target.dataset.fallbackAttempted && previewUrl) {
                    target.dataset.fallbackAttempted = 'true';
                    
                    const fallbackUrl = getFallbackUrl(previewUrl);
                    if (fallbackUrl && fallbackUrl !== finalUrl) {
                      console.log(`Trying fallback URL for ${fieldName}:`, fallbackUrl);
                      target.src = fallbackUrl;
                      return;
                    }
                  }
                  
                  // Si todo falla, marcar como error y mostrar placeholder
                  setImageLoadErrors(prev => ({ ...prev, [fieldName]: true }));
                  target.style.display = 'none';
                  const placeholder = target.parentElement?.querySelector('.edit-entrepreneur-form__preview-placeholder') as HTMLElement;
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                    const errorSpan = placeholder.querySelector('span');
                    if (errorSpan) {
                      errorSpan.textContent = 'Error cargando imagen - Click en "Reemplazar" para actualizar';
                    }
                  }
                }}
                onLoad={(e) => {
                  const placeholder = e.currentTarget.parentElement?.querySelector('.edit-entrepreneur-form__preview-placeholder') as HTMLElement;
                  if (placeholder) {
                    placeholder.style.display = 'none';
                  }
                  e.currentTarget.style.display = 'block';
                  // Limpiar el error si la imagen carga exitosamente
                  setImageLoadErrors(prev => ({ ...prev, [fieldName]: false }));
                }}
                style={{ display: hasError ? 'none' : 'block' }}
              />
              <div className="edit-entrepreneur-form__preview-placeholder" style={{ display: hasError ? 'flex' : 'none' }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Error cargando imagen</span>
              </div>
            </>
          ) : (
            <div className="edit-entrepreneur-form__preview-placeholder">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{hasError ? 'Error cargando imagen' : 'No hay imagen'}</span>
            </div>
          )}

          <div className="edit-entrepreneur-form__preview-actions">
            <button
              type="button"
              className="edit-entrepreneur-form__btn-replace"
              onClick={() => handleReplaceImage(fieldName)}
            >
              {previewUrl && !hasError ? 'Reemplazar' : hasError ? 'Intentar de nuevo' : 'Agregar imagen'}
            </button>
          </div>
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
          showCharacterCount: true
        })}

        {renderField('description', {
          label: 'Descripción',
          required: true,
          type: 'textarea',
          placeholder: 'Describe tu emprendimiento en pocas palabras (mínimo 80 caracteres)',
          minLength: 80,
          maxLength: 150,
          showCharacterCount: true
        })}

        {renderField('location', {
          label: 'Ubicación',
          required: true,
          placeholder: 'Ej: San José, Costa Rica',
          maxLength: 150,
          showCharacterCount: true
        })}

        {renderField('category', {
          label: 'Categoría',
          required: true,
          type: 'select',
          options: ENTREPRENEURSHIP_CATEGORIES
        })}

        {renderField('approach', {
          label: 'Enfoque',
          required: true,
          type: 'select',
          options: ENTREPRENEURSHIP_APPROACHES.map((a) => a.value)
        })}
      </div>

      <div className="edit-entrepreneur-form__section">
        <h4 className="edit-entrepreneur-form__section-title">Imágenes del Emprendimiento</h4>
        <p className="edit-entrepreneur-form__section-description">
          Puedes ver las imágenes actuales y reemplazarlas si es necesario. Formatos aceptados: JPEG, PNG, GIF, etc.
        </p>

        <div className="edit-entrepreneur-form__row edit-entrepreneur-form__row--urls">
          {renderImageField('url_1', 'Imagen 1')}
          {renderImageField('url_2', 'Imagen 2')}
          {renderImageField('url_3', 'Imagen 3')}
        </div>
      </div>

      <div className="edit-entrepreneur-form__step-actions">
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