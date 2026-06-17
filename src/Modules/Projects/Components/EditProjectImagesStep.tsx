import type { Project, ProjectUpdateData } from '../Services/ProjectsServices';
import { API_BASE_URL } from '../../../config/env';
import '../Styles/EditProjectForm.css';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ImagePlus } from 'lucide-react';
import { resizeImage, isHeicFile } from '../../Shared/utils/resizeImage';
import ImageCardActions from '../../Shared/components/ImageCardActions';

const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

type FileFieldName = 'url_1' | 'url_2' | 'url_3' | 'url_4' | 'url_5' | 'url_6';

interface EditProjectImagesStepProps {
  project: Project;
  formValues: Omit<ProjectUpdateData, 'Id_project' | 'Active'>;
  onPrevious: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  renderField: (name: keyof Omit<ProjectUpdateData, 'Id_project' | 'Active'>, config?: any) => React.ReactNode;
  form: any;
  imageActions: { [key in FileFieldName]?: 'keep' | 'replace' | 'delete' | 'add' };
  setImageActions: React.Dispatch<React.SetStateAction<{ [key in FileFieldName]?: 'keep' | 'replace' | 'delete' | 'add' }>>;
  errorMessage?: string;
}

const EditProjectImagesStep = ({
  project,
  formValues,
  onPrevious,
  onSubmit,
  onCancel,
  isLoading,
  form,
  imageActions,
  setImageActions,
  errorMessage
}: EditProjectImagesStepProps) => {
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const [previewCache, setPreviewCache] = useState<{ [key: string]: string }>({});
  const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: string]: boolean }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: string]: string }>({});

  // Memoizar campos de imagen para evitar recreación
  const imageFields = useMemo(() =>
    ['url_1', 'url_2', 'url_3', 'url_4', 'url_5', 'url_6'] as const,
    []
  );

  // Inicializar acciones basadas en el estado del proyecto
  useEffect(() => {
    // Evitar inicialización múltiple
    if (Object.keys(imageActions).length > 0) return;

    const initialActions: { [key in FileFieldName]?: 'keep' } = {};
    let hasChanges = false;

    imageFields.forEach((fieldName) => {
      const existingUrl = project[fieldName];
      if (existingUrl && typeof existingUrl === 'string' && existingUrl.trim() !== '') {
        initialActions[fieldName] = 'keep';
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setImageActions(initialActions);
    }
  }, [project, setImageActions, imageActions, imageFields]);

  // Limpiar object URLs al desmontar el componente
  useEffect(() => {
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  // Función para convertir URL de Drive al formato proxy
  const getProxyImageUrl = useCallback((url: string): string => {
    if (!url) return '';

    if (url.startsWith('blob:')) return url;
    if (url.includes('/images/proxy')) return url;

    if (url.includes('drive.google.com')) {
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    }

    return url;
  }, []);

  // Memoizar valores de formulario para previews
  const formValuesSnapshot = useMemo(() => ({
    url_1: formValues.url_1,
    url_2: formValues.url_2,
    url_3: formValues.url_3,
    url_4: formValues.url_4,
    url_5: formValues.url_5,
    url_6: formValues.url_6,
  }), [
    formValues.url_1,
    formValues.url_2,
    formValues.url_3,
    formValues.url_4,
    formValues.url_5,
    formValues.url_6,
  ]);

  // Precalcular las previews
  useEffect(() => {
    const newPreviewCache: { [key: string]: string } = {};
    const newObjectUrls: string[] = [];

    imageFields.forEach((fieldName) => {
      const currentValue = formValuesSnapshot[fieldName];
      const existingUrl = project[fieldName];
      const action = imageActions[fieldName];

      // Si la acción es delete, no mostrar preview
      if (action === 'delete') {
        return;
      }

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
  }, [formValuesSnapshot, project, imageActions, imageFields]);

  const getPreview = useCallback((fieldName: FileFieldName): string | null => {
    return previewCache[fieldName] || null;
  }, [previewCache]);

  const handleProcessFile = useCallback(async (fieldName: FileFieldName, file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !isHeicFile(file)) {
      setImageErrors(prev => ({ ...prev, [fieldName]: 'Formato no permitido. Solo se aceptan: JPG, PNG, WebP.' }));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageErrors(prev => ({ ...prev, [fieldName]: `La imagen no debe superar ${MAX_IMAGE_SIZE_MB}MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB.` }));
      return;
    }

    let optimized: File;
    try {
      optimized = await resizeImage(file);
    } catch {
      setImageErrors(prev => ({ ...prev, [fieldName]: 'No se pudo procesar la imagen. Intenta con otro archivo.' }));
      return;
    }

    setImageErrors(prev => ({ ...prev, [fieldName]: '' }));

    const existingUrl = project[fieldName];
    const currentValue = formValues[fieldName];

    // Determinar acción
    let action: 'replace' | 'add';

    if ((existingUrl && typeof existingUrl === 'string' && existingUrl.trim() !== '') ||
      (currentValue && !(currentValue instanceof File) && currentValue !== '')) {
      action = 'replace';
    } else {
      action = 'add';
    }

    // Actualizar acción
    setImageActions(prev => ({
      ...prev,
      [fieldName]: action
    }));

    // Crear Blob URL para preview instantáneo
    const objectUrl = URL.createObjectURL(optimized);

    // Actualizar form
    form.setFieldValue(fieldName, optimized);

    // Actualizar caché de preview
    setPreviewCache(prev => ({
      ...prev,
      [fieldName]: objectUrl,
    }));

    // Registrar URL para limpieza
    setObjectUrls(prev => [...prev, objectUrl]);

    // Limpiar error de carga
    setImageLoadErrors(prev => ({ ...prev, [fieldName]: false }));
  }, [form, project, formValues, setImageActions]);

  const handleReplaceImage = useCallback((fieldName: FileFieldName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleProcessFile(fieldName, file);
      }
    };
    input.click();
  }, [handleProcessFile]);

  const handleDeleteImage = useCallback((fieldName: FileFieldName) => {
    setImageActions(prev => ({
      ...prev,
      [fieldName]: 'delete'
    }));

    form.setFieldValue(fieldName, '');

    setPreviewCache(prev => {
      const newCache = { ...prev };
      delete newCache[fieldName];
      return newCache;
    });

    setImageLoadErrors(prev => ({ ...prev, [fieldName]: false }));
  }, [form, setImageActions]);

  const handleAddImage = useCallback((fieldName: FileFieldName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleProcessFile(fieldName, file);
      }
    };

    input.click();
  }, [handleProcessFile]);

  // Memoizar el estado de cada campo para evitar cálculos repetidos
  const getFieldState = useCallback((fieldName: FileFieldName) => {
    const currentValue = formValues[fieldName];
    const previewUrl = getPreview(fieldName);
    const isNewFile = currentValue instanceof File;
    const hasError = imageLoadErrors[fieldName];
    const action = imageActions[fieldName];
    const existingUrl = project[fieldName];

    const isEmptyField =
      !existingUrl &&
      (!currentValue || currentValue === '') &&
      !previewUrl &&
      action !== 'delete';

    let finalUrl = null;
    if (previewUrl && action !== 'delete') {
      finalUrl = isNewFile ? previewUrl : getProxyImageUrl(previewUrl);
    }

    return {
      currentValue,
      previewUrl,
      isNewFile,
      hasError,
      action,
      existingUrl: !!existingUrl,
      isEmptyField,
      finalUrl
    };
  }, [formValues, getPreview, imageLoadErrors, imageActions, project, getProxyImageUrl]);

  // Memoizar la renderización de campos de imagen
  const renderedImageFields = useMemo(() => {
    return imageFields.map((fieldName, idx) => {
      const fieldState = getFieldState(fieldName);
      const { isEmptyField, hasError, finalUrl, isNewFile, action } = fieldState;

      return (
        <div key={fieldName} className="edit-project-form__image-upload">
          {imageErrors[fieldName] && (
            <span className="edit-project-form__error-text">{imageErrors[fieldName]}</span>
          )}
          <div
            className={`edit-project-form__image-upload-box${finalUrl && !hasError ? ' edit-project-form__image-upload-box--filled' : ''}`}
            onClick={(e) => {
              if (!finalUrl || hasError) {
                e.preventDefault();
                e.stopPropagation();
                handleAddImage(fieldName);
              }
            }}
            style={{ cursor: !finalUrl || hasError ? 'pointer' : 'default' }}
          >
            {finalUrl && !hasError ? (
              <div className="edit-project-form__image-preview">
                <img
                  src={finalUrl}
                  alt={`Preview ${idx + 1}`}
                  crossOrigin="anonymous"
                  onError={() => {
                    setImageLoadErrors(prev => ({ ...prev, [fieldName]: true }));
                  }}
                  onLoad={() => {
                    setImageLoadErrors(prev => ({ ...prev, [fieldName]: false }));
                  }}
                />
                <ImageCardActions
                  onReplace={() => handleReplaceImage(fieldName)}
                  onDelete={() => handleDeleteImage(fieldName)}
                />
              </div>
            ) : (
              <div className="edit-project-form__image-upload-label">
                {hasError ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <ImagePlus size={28} />
                )}
                <span>
                  {hasError ? 'Error - Click para reintentar' : 'Subir imagen'}
                </span>
              </div>
            )}
          </div>
          <div className="edit-project-form__image-field-info">
            <span className="edit-project-form__image-field-name">{`Imagen ${idx + 1}`}</span>
            {isNewFile && action === 'add' && (
              <span className="edit-project-form__image-new-indicator">Nueva imagen</span>
            )}
            {isNewFile && action === 'replace' && (
              <span className="edit-project-form__image-new-indicator" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                Reemplazando
              </span>
            )}
            {action === 'delete' && (
              <span className="edit-project-form__image-new-indicator" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                Se eliminará
              </span>
            )}
            {isEmptyField && !action && (
              <span className="edit-project-form__image-new-indicator" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                Vacío
              </span>
            )}
          </div>
        </div>
      );
    });
  }, [imageFields, getFieldState, handleAddImage, handleReplaceImage, handleDeleteImage, imageErrors]);

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
            Actualiza las imágenes del proyecto (máximo 6 imágenes opcionales)
          </p>
        </div>
      </div>

      <p className="edit-project-form__image-hint">
        Formatos aceptados: JPG, PNG, WebP · Tamaño máximo: 10MB por imagen
      </p>

      <div className="edit-project-form__image-grid">
        {renderedImageFields}
      </div>

      <div className="edit-project-form__images-note">
        <p><strong>Nota:</strong> Puedes agregar, reemplazar o eliminar imágenes de forma independiente:</p>
        <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
          <li><strong>Agregar:</strong> Click en un campo vacío para subir una nueva imagen</li>
          <li><strong>Reemplazar:</strong> Click en el ícono de actualizar sobre una imagen existente</li>
          <li><strong>Eliminar:</strong> Click en el ícono de basura sobre una imagen existente</li>
          <li><strong>Mantener:</strong> Las imágenes sin modificar se conservarán automáticamente</li>
        </ul>
      </div>

      {errorMessage && (
        <div className="edit-project-form__error">
          <p style={{ whiteSpace: 'pre-line' }}>{errorMessage}</p>
        </div>
      )}

      <div className="edit-project-form__step-actions">
        <button
          type="button"
          onClick={onCancel}
          className="edit-project-form__cancel-btn"
        >
          Cancelar
        </button>
        <div className="edit-project-form__navigation-buttons">
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
    </div>
  );
};

export default EditProjectImagesStep;