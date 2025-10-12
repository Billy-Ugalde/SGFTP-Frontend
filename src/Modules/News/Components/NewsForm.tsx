import React from 'react';
import { useForm } from 'react-hook-form';
import type { CreateNewsInput, NewsStatus } from '../Services/NewsServices';
import ConfirmationModal from './ConfirmationModal';
import '../Styles/NewsForm.css';

type Constraints = {
  title: { minLength: number; maxLength: number };
  content: { minLength: number; maxLength: number };
  author: { minLength: number; maxLength: number };
};

const DEFAULT_CONSTRAINTS: Constraints = {
  title:   { minLength: 30,  maxLength: 150 },
  content: { minLength: 100, maxLength: 2000 },
  author:  { minLength: 20,  maxLength: 100 },
};

type Props = {
  defaultValues?: Partial<CreateNewsInput>;
  onSubmit: (data: CreateNewsInput) => void;
  submitting?: boolean;
  /** Rangos opcionales por si los pasas desde Create/Edit; si no, usa los defaults */
  constraints?: Constraints;
};

// RHF usa FileList para inputs de archivo
type FormValues = Omit<CreateNewsInput, 'file'> & { file?: FileList };

const IMG_OK = ['image/png', 'image/jpeg'];
const hasExt = (name: string, exts: string[]) => exts.some((e) => name.toLowerCase().endsWith(e));

export default function NewsForm({ defaultValues, onSubmit, submitting, constraints }: Props) {
  const limits = constraints ?? DEFAULT_CONSTRAINTS;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: defaultValues?.title || '',
      author: defaultValues?.author || '',
      content: defaultValues?.content || '',
      status: (defaultValues?.status as NewsStatus) || 'draft',
    },
  });

  // Valores en vivo para los contadores
  const titleVal   = watch('title')   ?? '';
  const authorVal  = watch('author')  ?? '';
  const contentVal = watch('content') ?? '';

  // Si hay defaultValues asumimos edición
  const isEdit = !!defaultValues;

  const fileList = watch('file');
  const file: File | undefined = fileList && fileList.length > 0 ? fileList[0] : undefined;

  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<CreateNewsInput | null>(null);

  // Establecer la imagen actual al montar el componente en modo edición
  React.useEffect(() => {
    if (isEdit && defaultValues?.image_url) {
      setCurrentImageUrl(defaultValues.image_url);
    }
  }, [isEdit, defaultValues?.image_url]);

  // Manejar preview de nuevo archivo seleccionado
  React.useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const ok = IMG_OK.includes(file.type) || hasExt(file.name, ['.png', '.jpg', '.jpeg']);
    if (!ok) {
      setFormError('La imagen debe ser PNG o JPG.');
      setValue('file', undefined as any, { shouldDirty: true });
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = e => setPreview(String(e.target?.result || ''));
    reader.readAsDataURL(file);
  }, [file, setValue]);

  const submit = handleSubmit((vals) => {
    setFormError(null);

    // En crear el archivo es obligatorio; en editar es opcional
    if (!isEdit && !file) {
      setFormError('La imagen es obligatoria (PNG/JPG).');
      return;
    }
    if (file) {
      const ok = IMG_OK.includes(file.type) || hasExt(file.name, ['.png', '.jpg', '.jpeg']);
      if (!ok) {
        setFormError('La imagen debe ser PNG o JPG.');
        return;
      }
    }

    const data: CreateNewsInput = {
      title: vals.title.trim(),
      author: vals.author.trim(),
      content: vals.content.trim(),
      status: vals.status as NewsStatus,
      file, // el service lo envía como 'file' a multipart/FormData
    } as CreateNewsInput;

    // Si está editando o creando con estado 'published', mostrar modal
    if (isEdit || vals.status === 'published') {
      setPendingData(data);
      setShowConfirmModal(true);
    } else {
      // Si es creación con estado 'draft', enviar directo
      onSubmit(data);
    }
  });

  const handleConfirmSubmit = () => {
    if (pendingData) {
      onSubmit(pendingData);
      setShowConfirmModal(false);
      setPendingData(null);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
    setPendingData(null);
  };

  // Fusionar el ref de RHF con nuestro ref para poder limpiar el input
  const fileRegister = register('file');
  const mergedFileRef = (el: HTMLInputElement | null) => {
    fileRegister.ref(el);
    fileRef.current = el;
  };

  return (
    <form onSubmit={submit} className="news-form" noValidate>
      <div className="news-form__grid">
        <div className="news-form__field">
          <label>Título *</label>
          <input
            {...register('title', {
              required: 'Requerido',
              minLength: { value: limits.title.minLength, message: `Mínimo ${limits.title.minLength} caracteres` },
              maxLength: { value: limits.title.maxLength, message: `Máximo ${limits.title.maxLength} caracteres` },
            })}
            placeholder="Título de la noticia"
            minLength={limits.title.minLength}
            maxLength={limits.title.maxLength}
          />
          {/* contador y mínimo */}
          <div className="news-form__char-row">
            <span className="news-form__char-hint">Mínimo: {limits.title.minLength} caracteres</span>
            <span className={`news-form__char-count ${titleVal.length >= limits.title.maxLength ? 'news-form__char-count--limit' : ''}`}>
              {titleVal.length}/{limits.title.maxLength}
            </span>
          </div>
          {errors.title && <small className="news-form__error">{errors.title.message}</small>}
        </div>

        <div className="news-form__field">
          <label>Autor *</label>
          <input
            {...register('author', {
              required: 'Requerido',
              minLength: { value: limits.author.minLength, message: `Mínimo ${limits.author.minLength} caracteres` },
              maxLength: { value: limits.author.maxLength, message: `Máximo ${limits.author.maxLength} caracteres` },
            })}
            placeholder="Nombre del autor"
            minLength={limits.author.minLength}
            maxLength={limits.author.maxLength}
          />
          <div className="news-form__char-row">
            <span className="news-form__char-hint">Mínimo: {limits.author.minLength} caracteres</span>
            <span className={`news-form__char-count ${authorVal.length >= limits.author.maxLength ? 'news-form__char-count--limit' : ''}`}>
              {authorVal.length}/{limits.author.maxLength}
            </span>
          </div>
          {errors.author && <small className="news-form__error">{errors.author.message}</small>}
        </div>
      </div>

      <div className="news-form__field">
        <label>Contenido *</label>
        <textarea
          rows={8}
          {...register('content', {
            required: 'Requerido',
            minLength: { value: limits.content.minLength, message: `Mínimo ${limits.content.minLength} caracteres` },
            maxLength: { value: limits.content.maxLength, message: `Máximo ${limits.content.maxLength} caracteres` },
          })}
          placeholder="Escribe el contenido"
          minLength={limits.content.minLength}
          maxLength={limits.content.maxLength}
        />
        <div className="news-form__char-row">
          <span className="news-form__char-hint">Mínimo: {limits.content.minLength} caracteres</span>
          <span className={`news-form__char-count ${contentVal.length >= limits.content.maxLength ? 'news-form__char-count--limit' : ''}`}>
            {contentVal.length}/{limits.content.maxLength}
          </span>
        </div>
        {errors.content && <small className="news-form__error">{errors.content.message}</small>}
      </div>

      <div className="news-form__field">
        <label>Estado</label>
        <select {...register('status')}>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
        </select>
      </div>

      <div className="news-form__field">
        <label>
          {isEdit ? 'Nueva imagen (PNG/JPG)' : 'Imagen (PNG/JPG) *'}
        </label>
        <div className="news-form__file-upload-box">
          <input
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            {...fileRegister}
            ref={mergedFileRef}
            className="news-form__file-input"
            id="news-image-upload"
          />
          <label htmlFor="news-image-upload" className="news-form__file-label">
            {preview || currentImageUrl ? (
              <div className="news-form__file-preview">
                <img src={preview || currentImageUrl || ''} alt="Vista previa" />
                {preview && (
                  <div className="news-form__file-badge">Nueva imagen</div>
                )}
                <div className="news-form__file-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span>{preview ? 'Cambiar nueva imagen' : 'Cambiar imagen actual'}</span>
                </div>
              </div>
            ) : (
              <div className="news-form__file-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="news-form__file-placeholder-text">Haz clic para subir una imagen</span>
                <span className="news-form__file-placeholder-hint">PNG o JPG</span>
              </div>
            )}
          </label>
        </div>
        {formError && <small className="news-form__error">{formError}</small>}
      </div>

      <div className="news-form__actions">
        <button type="submit" disabled={!!submitting}>
          {submitting ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      <ConfirmationModal
        show={showConfirmModal}
        onClose={handleCancelSubmit}
        onConfirm={handleConfirmSubmit}
        title={isEdit ? 'Confirmar edición de noticia' : 'Confirmar publicación de noticia'}
        message={
          isEdit
            ? `¿Estás seguro de que deseas guardar los cambios en la noticia "${pendingData?.title}"?`
            : `¿Estás seguro de que deseas crear y publicar la noticia "${pendingData?.title}"?\n\nLa noticia será visible públicamente de inmediato.`
        }
        confirmText={isEdit ? 'Guardar cambios' : 'Publicar noticia'}
        cancelText="Cancelar"
        type="info"
        isLoading={submitting}
      />
    </form>
  );
}
