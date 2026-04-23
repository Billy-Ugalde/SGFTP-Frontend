import React from 'react';
import { useForm } from 'react-hook-form';
import { Newspaper } from 'lucide-react';
import type { CreateNewsInput, NewsStatus } from '../Services/NewsServices';

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
  onSubmit: (data: CreateNewsInput) => Promise<void>;
  submitting?: boolean;
  /** Rangos opcionales por si los pasas desde Create/Edit; si no, usa los defaults */
  constraints?: Constraints;
  /** URL de imagen existente (solo en modo edición) */
  existingImageUrl?: string | null;
};

// RHF usa FileList para inputs de archivo
type FormValues = Omit<CreateNewsInput, 'file'> & { file?: FileList };

const IMG_OK = ['image/png', 'image/jpeg'];
const hasExt = (name: string, exts: string[]) => exts.some((e) => name.toLowerCase().endsWith(e));

export default function NewsForm({ defaultValues, onSubmit, submitting, constraints, existingImageUrl }: Props) {
  const limits = constraints ?? DEFAULT_CONSTRAINTS;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: defaultValues?.title || '',
      author: defaultValues?.author || '',
      content: defaultValues?.content || '',
      status: (defaultValues?.status as NewsStatus) || 'draft',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
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
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [statusTouched, setStatusTouched] = React.useState(false);

  // Establecer la imagen actual al montar el componente en modo edición
  React.useEffect(() => {
    if (isEdit && existingImageUrl) {
      setCurrentImageUrl(existingImageUrl);
    }
  }, [isEdit, existingImageUrl]);

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
    setFormError(null); // archivo válido: limpiar cualquier error previo de imagen
    const reader = new FileReader();
    reader.onload = e => setPreview(String(e.target?.result || ''));
    reader.readAsDataURL(file);
  }, [file, setValue]);

  const submit = handleSubmit(
    async (vals) => {
    setFormError(null);
    setApiError(null);

    // En crear el archivo es obligatorio; en editar es opcional
    if (!isEdit && !file) {
      setFormError('Debes subir una imagen.');
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
      file,
    } as CreateNewsInput;

    try {
      await onSubmit(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setApiError(Array.isArray(msg) ? msg.join(', ') : msg || err?.message || 'Error al guardar la noticia.');
    }
  },
  () => {
    if (!isEdit && !file) {
      setFormError('Debes subir una imagen.');
    }
  });


  const handleRemoveImage = () => {
    setPreview(null);
    setCurrentImageUrl(null);
    setFormError(null);
    setValue('file', undefined as any, { shouldDirty: true });
    if (fileRef.current) fileRef.current.value = '';
  };

  // Fusionar el ref de RHF con nuestro ref para poder limpiar el input
  const fileRegister = register('file');
  const mergedFileRef = (el: HTMLInputElement | null) => {
    fileRegister.ref(el);
    fileRef.current = el;
  };

  return (
    <form onSubmit={submit} className="news-form" noValidate>
      {/* Header */}
      <div className="news-form__step-header">
        <div className="news-form__step-icon">
          <Newspaper size={24} />
        </div>
        <div>
          <h3 className="news-form__step-title">{isEdit ? 'Editar Noticia' : 'Nueva Noticia'}</h3>
          <p className="news-form__step-description">
            {isEdit ? 'Modifica los datos de la noticia' : 'Completa los datos para crear la noticia'}
          </p>
        </div>
        <p className="news-form__required-legend">
          <span className="news-form__required">*</span> Campo obligatorio
        </p>
      </div>

      <div className="news-form__fields">
      <div className="news-form__grid">
        <div className="news-form__field">
          <label>
            Título{' '}
            {titleVal.length < limits.title.minLength && <span className="news-form__required">*</span>}
          </label>
          <input
            {...register('title', {
              required: 'El título es obligatorio.',
              minLength: { value: limits.title.minLength, message: `El título debe tener al menos ${limits.title.minLength} caracteres.` },
              maxLength: { value: limits.title.maxLength, message: `El título no puede superar ${limits.title.maxLength} caracteres.` },
              onChange: () => clearErrors('title'),
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
          {errors.title && <span className="news-form__error-text">{errors.title.message}</span>}
        </div>

        <div className="news-form__field">
          <label>
            Autor{' '}
            {authorVal.length < limits.author.minLength && <span className="news-form__required">*</span>}
          </label>
          <input
            {...register('author', {
              required: 'El autor es obligatorio.',
              minLength: { value: limits.author.minLength, message: `El autor debe tener al menos ${limits.author.minLength} caracteres.` },
              maxLength: { value: limits.author.maxLength, message: `El autor no puede superar ${limits.author.maxLength} caracteres.` },
              onChange: () => clearErrors('author'),
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
          {errors.author && <span className="news-form__error-text">{errors.author.message}</span>}
        </div>
      </div>

      <div className="news-form__field">
        <label>
          Contenido{' '}
          {contentVal.length < limits.content.minLength && <span className="news-form__required">*</span>}
        </label>
        <textarea
          rows={8}
          {...register('content', {
            required: 'El contenido es obligatorio.',
            minLength: { value: limits.content.minLength, message: `El contenido debe tener al menos ${limits.content.minLength} caracteres.` },
            maxLength: { value: limits.content.maxLength, message: `El contenido no puede superar ${limits.content.maxLength} caracteres.` },
            onChange: () => clearErrors('content'),
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
        {errors.content && <span className="news-form__error-text">{errors.content.message}</span>}
      </div>

      <div className="news-form__field">
        <label>
          Estado{' '}
          {!statusTouched && (
            <span className="news-form__initial-editable">valor inicial editable</span>
          )}
        </label>
        <select {...register('status')} onChange={(e) => { register('status').onChange(e); setStatusTouched(true); }}>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
        </select>
      </div>

      <div className="news-form__field">
        <label>
          {isEdit ? 'Nueva imagen (PNG/JPG)' : <>Imagen (PNG/JPG){' '}{!file && !currentImageUrl && <span className="news-form__required">*</span>}</>}
        </label>

        {/* Input siempre en el DOM, siempre oculto */}
        <input
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          {...fileRegister}
          ref={mergedFileRef}
          className="news-form__file-input"
          id="news-image-upload"
        />

        {preview || currentImageUrl ? (
          <div className="news-form__image-upload-box">
            <div className="news-form__image-preview">
              <img src={preview || currentImageUrl || ''} alt="Vista previa" />
              <button
                type="button"
                className="news-form__image-remove"
                onClick={handleRemoveImage}
                title="Eliminar imagen"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <label className="news-form__image-upload-box" htmlFor="news-image-upload">
            <div className="news-form__image-upload-label">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Subir imagen</span>
            </div>
          </label>
        )}

        {formError && <span className="news-form__error-text">{formError}</span>}
      </div>

      {apiError && <span className="news-form__error-text">{apiError}</span>}
      </div>{/* /news-form__fields */}

      <div className="news-form__actions">
        <button type="submit" disabled={!!submitting}>
          {submitting ? 'Registrando noticia...' : (
            <>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Terminar noticia
            </>
          )}
        </button>
      </div>

    </form>
  );
}
