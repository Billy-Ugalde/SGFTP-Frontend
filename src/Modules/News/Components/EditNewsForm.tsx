import React from 'react';
import { useForm } from 'react-hook-form';
import { Newspaper, CheckCircle2 } from 'lucide-react';
import type { CreateNewsInput, NewsStatus } from '../Services/NewsServices';
import ConfirmationModal from './ConfirmationModal';
import ActivityFormDropdown from '../../Activities/Components/ActivityFormDropdown';
import { API_BASE_URL } from '../../../config/env';
import '../Styles/EditNewsForm.css';

const STATUS_OPTIONS = [
  {
    value: 'draft',
    label: 'Borrador',
    icon: (
      <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    value: 'published',
    label: 'Publicada',
    icon: <CheckCircle2 size={14} />,
  },
];

const getProxyImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('blob:')) return url;
  if (url.includes('/images/proxy')) return url;
  if (url.includes('drive.google.com')) {
    return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

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
  defaultValues: Partial<CreateNewsInput>;
  onSubmit: (data: CreateNewsInput) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  constraints?: Constraints;
  existingImageUrl?: string | null;
};

type FormValues = Omit<CreateNewsInput, 'file'> & { file?: FileList };

const IMG_OK = ['image/png', 'image/jpeg'];
const hasExt = (name: string, exts: string[]) => exts.some((e) => name.toLowerCase().endsWith(e));

export default function EditNewsForm({ defaultValues, onSubmit, onCancel, submitting, constraints, existingImageUrl }: Props) {
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
      title:   defaultValues.title   || '',
      author:  defaultValues.author  || '',
      content: defaultValues.content || '',
      status:  (defaultValues.status as NewsStatus) || 'draft',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const titleVal   = watch('title')   ?? '';
  const authorVal  = watch('author')  ?? '';
  const contentVal = watch('content') ?? '';

  const fileList = watch('file');
  const file: File | undefined = fileList && fileList.length > 0 ? fileList[0] : undefined;

  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = React.useState<string | null>(existingImageUrl ?? null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [titleTouched,   setTitleTouched]   = React.useState(false);
  const [authorTouched,  setAuthorTouched]  = React.useState(false);
  const [contentTouched, setContentTouched] = React.useState(false);
  const [statusTouched,  setStatusTouched]  = React.useState(false);
  const [fileTouched,    setFileTouched]    = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<CreateNewsInput | null>(null);

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
    setFormError(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(String(e.target?.result || ''));
    reader.readAsDataURL(file);
  }, [file, setValue]);

  const submit = handleSubmit(async (vals) => {
    setFormError(null);
    setApiError(null);

    if (file) {
      const ok = IMG_OK.includes(file.type) || hasExt(file.name, ['.png', '.jpg', '.jpeg']);
      if (!ok) {
        setFormError('La imagen debe ser PNG o JPG.');
        return;
      }
    }

    const data: CreateNewsInput = {
      title:   vals.title.trim(),
      author:  vals.author.trim(),
      content: vals.content.trim(),
      status:  vals.status as NewsStatus,
      file,
    } as CreateNewsInput;

    setPendingData(data);
    setShowConfirm(true);
  });

  const handleConfirm = async () => {
    if (!pendingData) return;
    try {
      await onSubmit(pendingData);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setApiError(Array.isArray(msg) ? msg.join(', ') : msg || err?.message || 'Error al guardar la noticia.');
    } finally {
      setShowConfirm(false);
      setPendingData(null);
    }
  };

  const handleReplaceImage = () => {
    fileRef.current?.click();
  };

  const fileRegister = register('file');
  const mergedFileRef = (el: HTMLInputElement | null) => {
    fileRegister.ref(el);
    fileRef.current = el;
  };

  return (
    <form id="edit-news-form" onSubmit={submit} className="news-form" noValidate>
      <div className="news-form__step-header">
        <div className="news-form__step-icon" style={{ background: '#2563eb' }}>
          <Newspaper size={24} />
        </div>
        <div>
          <h3 className="news-form__step-title">Editar Noticia</h3>
          <p className="news-form__step-description">Modifica los datos de la noticia</p>
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
              {!titleTouched && <span className="news-form__initial-editable">valor inicial editable</span>}
            </label>
            <input
              {...register('title', {
                required: 'El título es obligatorio.',
                minLength: { value: limits.title.minLength, message: `El título debe tener al menos ${limits.title.minLength} caracteres.` },
                maxLength: { value: limits.title.maxLength, message: `El título no puede superar ${limits.title.maxLength} caracteres.` },
                onChange: () => { clearErrors('title'); setTitleTouched(true); },
              })}
              placeholder="Título de la noticia"
              minLength={limits.title.minLength}
              maxLength={limits.title.maxLength}
            />
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
              {!authorTouched && <span className="news-form__initial-editable">valor inicial editable</span>}
            </label>
            <input
              {...register('author', {
                required: 'El autor es obligatorio.',
                minLength: { value: limits.author.minLength, message: `El autor debe tener al menos ${limits.author.minLength} caracteres.` },
                maxLength: { value: limits.author.maxLength, message: `El autor no puede superar ${limits.author.maxLength} caracteres.` },
                onChange: () => { clearErrors('author'); setAuthorTouched(true); },
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
            {!contentTouched && <span className="news-form__initial-editable">valor inicial editable</span>}
          </label>
          <textarea
            rows={8}
            {...register('content', {
              required: 'El contenido es obligatorio.',
              minLength: { value: limits.content.minLength, message: `El contenido debe tener al menos ${limits.content.minLength} caracteres.` },
              maxLength: { value: limits.content.maxLength, message: `El contenido no puede superar ${limits.content.maxLength} caracteres.` },
              onChange: () => { clearErrors('content'); setContentTouched(true); },
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

        <ActivityFormDropdown
          label="Estado"
          value={watch('status') ?? 'draft'}
          onChange={(v) => {
            setValue('status', v as NewsStatus);
            setStatusTouched(true);
          }}
          options={STATUS_OPTIONS}
          showInitialEditable={!statusTouched}
        />

        <div className="news-form__field">
          <label>
            Nueva imagen (PNG/JPG){' '}
            {!fileTouched && <span className="news-form__initial-editable">valor inicial editable</span>}
          </label>

          <input
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            {...fileRegister}
            ref={mergedFileRef}
            className="news-form__file-input"
            id="news-image-upload"
            onChange={(e) => { fileRegister.onChange(e); setFileTouched(true); }}
          />

          {preview || currentImageUrl ? (
            <div className="news-form__image-upload-box">
              <div className="news-form__image-preview">
                <img src={preview || getProxyImageUrl(currentImageUrl || '')} alt="Vista previa" />
                <button
                  type="button"
                  className="news-form__image-replace-btn"
                  onClick={handleReplaceImage}
                  title="Reemplazar imagen"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
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
      </div>

      <div className="news-form__actions">
        <button
          type="button"
          className="news-form__cancel-btn"
          onClick={onCancel}
          disabled={!!submitting}
        >
          Cancelar
        </button>
        <button type="submit" disabled={!!submitting} style={{ background: submitting ? undefined : '#2563eb' }} onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }} onMouseLeave={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; }}>
          {submitting ? 'Actualizando...' : 'Actualizar Noticia'}
        </button>
      </div>

      <ConfirmationModal
        show={showConfirm}
        onClose={() => { setShowConfirm(false); setPendingData(null); }}
        onConfirm={handleConfirm}
        title="Guardar cambios"
        message="¿Deseas guardar los cambios realizados en la noticia?"
        confirmText="Sí, guardar"
        cancelText="Cancelar"
        type="info"
        isLoading={!!submitting}
      />
    </form>
  );
}
