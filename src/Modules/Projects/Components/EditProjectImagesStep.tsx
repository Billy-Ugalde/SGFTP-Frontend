import type { Project, ProjectUpdateData } from '../Services/ProjectsServices';
import '../Styles/EditProjectForm.css';
import { useState, useEffect, useCallback } from 'react';

type FileFieldName = 'url_1' | 'url_2' | 'url_3' | 'url_4' | 'url_5' | 'url_6';

interface EditProjectImagesStepProps {
  project: Project;
  formValues: Omit<ProjectUpdateData, 'Id_project' | 'Active'>;
  onPrevious: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  renderField: (name: keyof Omit<ProjectUpdateData, 'Id_project' | 'Active'>, config?: any) => React.ReactNode;
  form: any;
}

const EditProjectImagesStep = ({
  project,
  formValues,
  onPrevious,
  onSubmit,
  isLoading,
  renderField,
  form
}: EditProjectImagesStepProps) => {
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
      const baseUrl = 'http://localhost:3001';
      return `${baseUrl}/images/proxy?url=${encodeURIComponent(url)}`;
    }
    
    // Para otras URLs, devolver tal cual
    return url;
  }, []);

  // Precalcular las previews
  useEffect(() => {
    const newPreviewCache: { [key: string]: string } = {};
    const newObjectUrls: string[] = [];

    (['url_1', 'url_2', 'url_3', 'url_4', 'url_5', 'url_6'] as const).forEach((fieldName) => {
      const currentValue = formValues[fieldName];
      const existingUrl = project[fieldName];

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
    formValues.url_4,
    formValues.url_5,
    formValues.url_6,
    project.url_1,
    project.url_2,
    project.url_3,
    project.url_4,
    project.url_5,
    project.url_6
  ]);

  const getPreview = useCallback((fieldName: FileFieldName): string | null => {
    return previewCache[fieldName] || null;
  }, [previewCache]);

  const handleProcessFile = useCallback((fieldName: FileFieldName, file: File) => {
    // 1. Crear Blob URL para preview instantáneo
    const objectUrl = URL.createObjectURL(file);
    
    // 2. Actualizar form - aquí se envía el File que será procesado en el servicio
    form.setFieldValue(fieldName, file);
    
    // 3. Actualizar caché de preview
    setPreviewCache(prev => ({
      ...prev,
      [fieldName]: objectUrl,
    }));
    
    // 4. Registrar URL para limpieza
    setObjectUrls(prev => [...prev, objectUrl]);

    // 5. Limpiar el error de carga para este campo
    setImageLoadErrors(prev => ({ ...prev, [fieldName]: false }));
  }, [form]);

  const handleReplaceImage = (fieldName: FileFieldName) => {
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

  const renderImageField = (fieldName: FileFieldName, label: string, idx: number) => {
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
      <div key={fieldName} className="edit-project-form__image-upload">
        <div className="edit-project-form__image-upload-box">
          {finalUrl && !hasError ? (
            <div className="edit-project-form__image-preview">
              <img
                src={finalUrl}
                alt={`Preview ${idx + 1}`}
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error(`Error loading image for ${fieldName}:`, finalUrl);
                  setImageLoadErrors(prev => ({ ...prev, [fieldName]: true }));
                }}
                onLoad={() => {
                  setImageLoadErrors(prev => ({ ...prev, [fieldName]: false }));
                }}
              />
              <button
                type="button"
                className="edit-project-form__image-replace-btn"
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
              className="edit-project-form__image-upload-label"
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
        <div className="edit-project-form__image-field-info">
          <span className="edit-project-form__image-field-name">{label}</span>
          {isNewFile && (
            <span className="edit-project-form__image-new-indicator">Nueva imagen</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="edit-project-form__step-content">
      <div className="edit-project-form__step-header">
        <div className="edit-project-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="edit-project-form__step-title">Imágenes del Proyecto</h3>
          <p className="edit-project-form__step-description">
            Actualiza las imágenes del proyecto (máximo 6 imágenes)
          </p>
        </div>
      </div>

      <div className="edit-project-form__image-grid">
        {renderImageField('url_1', 'Imagen 1', 0)}
        {renderImageField('url_2', 'Imagen 2', 1)}
        {renderImageField('url_3', 'Imagen 3', 2)}
        {renderImageField('url_4', 'Imagen 4', 3)}
        {renderImageField('url_5', 'Imagen 5', 4)}
        {renderImageField('url_6', 'Imagen 6', 5)}
      </div>

      <div className="edit-project-form__images-note">
        <p>💡 <strong>Nota:</strong> Solo se actualizarán las imágenes que reemplaces. Las imágenes existentes se mantendrán si no las modificas.</p>
      </div>

      <div className="edit-project-form__step-actions">
        <button
          type="button"
          onClick={onPrevious}
          className="edit-project-form__back-btn"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior: Detalles
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="edit-project-form__submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="edit-project-form__spinner" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualizando...
            </>
          ) : (
            <>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Actualizar Proyecto
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditProjectImagesStep;