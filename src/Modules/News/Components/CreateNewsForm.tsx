import React from 'react';
import { useForm } from 'react-hook-form';
import { Newspaper, ImagePlus, CheckCircle2 } from 'lucide-react';
import type { CreateNewsInput, NewsStatus } from '../Services/NewsServices';
import ConfirmationModal from '../../Shared/components/ConfirmationModal';
import { copyCreate } from '../../Shared/utils/confirmationCopy';
import { hasSqlInjection, SQL_INJECTION_MESSAGE } from '../../Shared/utils/sqlGuard';
import { resizeImage, isHeicFile } from '../../Shared/utils/resizeImage';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import ImageCardActions from '../../Shared/components/ImageCardActions';
import ActivityFormDropdown from '../../Activities/Components/ActivityFormDropdown';
import '../Styles/CreateNewsForm.css';

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
  onSubmit: (data: CreateNewsInput) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
  constraints?: Constraints;
};

type FormValues = Omit<CreateNewsInput, 'file'> & { file?: FileList };

const IMG_OK = ['image/png', 'image/jpeg'];
const hasExt = (name: string, exts: string[]) => exts.some((e) => name.toLowerCase().endsWith(e));

export default function CreateNewsForm({ onSubmit, onCancel, submitting, constraints }: Props) {
  const limits = constraints ?? DEFAULT_CONSTRAINTS;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { title: '', author: '', content: '', status: 'draft' },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const titleVal   = watch('title')   ?? '';
  const authorVal  = watch('author')  ?? '';
  const contentVal = watch('content') ?? '';

  const getCharCountClass = (current: number, max: number) => {
    if (current >= max) return 'news-form__char-count--limit';
    if (current >= max - 10) return 'news-form__char-count--warning';
    return '';
  };

  const fileList = watch('file');
  const file: File | undefined = fileList && fileList.length > 0 ? fileList[0] : undefined;

  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [statusTouched, setStatusTouched] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<CreateNewsInput | null>(null);

  React.useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const ok =
      IMG_OK.includes(file.type) ||
      hasExt(file.name, ['.png', '.jpg', '.jpeg', '.heic', '.heif']) ||
      isHeicFile(file);
    if (!ok) {
      setFormError('La imagen debe ser PNG, JPG o HEIC (iPhone).');
      setValue('file', undefined as any, { shouldDirty: true });
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setFormError(null);

    let cancelled = false;
    let objectUrl: string | null = null;

    if (isHeicFile(file)) {
      resizeImage(file)
        .then(img => {
          if (cancelled) return;
          objectUrl = URL.createObjectURL(img);
          setPreview(objectUrl);
        })
        .catch(() => {
          if (!cancelled) {
            setFormError('No se pudo procesar la imagen del iPhone (HEIC). Intenta con otra foto.');
          }
        });
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        if (!cancelled) setPreview(String(e.target?.result || ''));
      };
      reader.readAsDataURL(file);
    }

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, setValue]);

  const submit = handleSubmit(
    async (vals) => {
      setFormError(null);
      setApiError(null);

      const isPublishing = vals.status === 'published';

      if (isPublishing && !file) {
        setFormError('Para publicar la noticia debes subir una imagen.');
        return;
      }
      let uploadFile = file;
      if (uploadFile) {
        const ok =
          IMG_OK.includes(uploadFile.type) ||
          hasExt(uploadFile.name, ['.png', '.jpg', '.jpeg', '.heic', '.heif']) ||
          isHeicFile(uploadFile);
        if (!ok) {
          setFormError('La imagen debe ser PNG, JPG o HEIC (iPhone).');
          return;
        }
        try {
          uploadFile = await resizeImage(uploadFile);
        } catch {
          setFormError('No se pudo procesar la imagen. Intenta con otro archivo.');
          return;
        }
      }

      const data: CreateNewsInput = {
        title: vals.title.trim(),
        author: vals.author.trim(),
        content: vals.content.trim(),
        status: vals.status as NewsStatus,
        file: uploadFile,
      } as CreateNewsInput;

      setPendingData(data);
      setShowConfirm(true);
    },
    () => {}
  );

  const handleConfirm = async () => {
    if (!pendingData) return;
    try {
      await onSubmit(pendingData);
    } catch (err: any) {
      setApiError(getApiErrorMessage(err, 'Error al guardar la noticia.'));
    } finally {
      setShowConfirm(false);
      setPendingData(null);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setFormError(null);
    setValue('file', undefined as any, { shouldDirty: true });
    if (fileRef.current) fileRef.current.value = '';
  };

  const fileRegister = register('file');
  const mergedFileRef = (el: HTMLInputElement | null) => {
    fileRegister.ref(el);
    fileRef.current = el;
  };

  return (
    <form onSubmit={submit} className="news-form news-form--create" noValidate>
      <div className="news-form__step-header">
        <div className="news-form__step-icon">
          <Newspaper size={24} />
        </div>
        <div>
          <h3 className="news-form__step-title">Nueva Noticia</h3>
          <p className="news-form__step-description">Completa los datos para crear la noticia</p>
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
                validate: (v) => !hasSqlInjection(v) || SQL_INJECTION_MESSAGE,
                onChange: () => clearErrors('title'),
              })}
              placeholder="Título de la noticia"
              minLength={limits.title.minLength}
              maxLength={limits.title.maxLength}
            />
            <div className="news-form__char-row">
              <span className="news-form__char-hint">Mínimo: {limits.title.minLength} caracteres</span>
              <span className={`news-form__char-count ${getCharCountClass(titleVal.length, limits.title.maxLength)}`}>
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
                validate: (v) => !hasSqlInjection(v) || SQL_INJECTION_MESSAGE,
                onChange: () => clearErrors('author'),
              })}
              placeholder="Nombre del autor"
              minLength={limits.author.minLength}
              maxLength={limits.author.maxLength}
            />
            <div className="news-form__char-row">
              <span className="news-form__char-hint">Mínimo: {limits.author.minLength} caracteres</span>
              <span className={`news-form__char-count ${getCharCountClass(authorVal.length, limits.author.maxLength)}`}>
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
              validate: (v) => !hasSqlInjection(v) || SQL_INJECTION_MESSAGE,
              onChange: () => clearErrors('content'),
            })}
            placeholder="Escribe el contenido"
            minLength={limits.content.minLength}
            maxLength={limits.content.maxLength}
          />
          <div className="news-form__char-row">
            <span className="news-form__char-hint">Mínimo: {limits.content.minLength} caracteres</span>
            <span className={`news-form__char-count ${getCharCountClass(contentVal.length, limits.content.maxLength)}`}>
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
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.heic,.heif,image/png,image/jpeg,image/heic,image/heif"
            {...fileRegister}
            ref={mergedFileRef}
            className="news-form__file-input"
            id="news-image-upload"
          />

          <p className="news-form__file-hint">Formatos aceptados: JPG, PNG · Tamaño máximo: 10MB por imagen</p>

          {preview ? (
            <div className="news-form__image-upload-box">
              <div className="news-form__image-preview">
                <img src={preview} alt="Vista previa" />
                <ImageCardActions
                  onReplace={() => fileRef.current?.click()}
                  onDelete={handleRemoveImage}
                />
              </div>
            </div>
          ) : (
            <label className="news-form__image-upload-box" htmlFor="news-image-upload">
              <div className="news-form__image-upload-label">
                <ImagePlus size={28} />
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

      <ConfirmationModal
        show={showConfirm}
        onClose={() => { setShowConfirm(false); setPendingData(null); }}
        onConfirm={handleConfirm}
        {...copyCreate({
          resourceWord: 'noticia',
          resourcePhrase: 'la noticia',
          name: titleVal.trim() || '(sin título)',
        })}
        cancelText="Cancelar"
        type="info"
        isLoading={!!submitting}
      />
    </form>
  );
}
