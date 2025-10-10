import React from 'react';
import { useForm } from 'react-hook-form';
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
      sendNewsletter: defaultValues?.sendNewsletter || false,
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
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) { setPreview(null); return; }
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

    onSubmit({
      title: vals.title.trim(),
      author: vals.author.trim(),
      content: vals.content.trim(),
      status: vals.status as NewsStatus,
      sendNewsletter: vals.sendNewsletter || false,
      file, // el service lo envía como 'file' a multipart/FormData
    } as CreateNewsInput);
  });

  // Fusionar el ref de RHF con nuestro ref para poder limpiar el input
  const fileRegister = register('file');
  const mergedFileRef = (el: HTMLInputElement | null) => {
    fileRegister.ref(el);
    fileRef.current = el;
  };

  return (
    <form onSubmit={submit} className="news-form" noValidate>
      <div className="grid">
        <div className="field">
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
          <div className="char-row">
            <span className="char-hint">Mínimo: {limits.title.minLength} caracteres</span>
            <span className={`char-count ${titleVal.length >= limits.title.maxLength ? 'is-limit' : ''}`}>
              {titleVal.length}/{limits.title.maxLength}
            </span>
          </div>
          {errors.title && <small className="error">{errors.title.message}</small>}
        </div>

        <div className="field">
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
          <div className="char-row">
            <span className="char-hint">Mínimo: {limits.author.minLength} caracteres</span>
            <span className={`char-count ${authorVal.length >= limits.author.maxLength ? 'is-limit' : ''}`}>
              {authorVal.length}/{limits.author.maxLength}
            </span>
          </div>
          {errors.author && <small className="error">{errors.author.message}</small>}
        </div>
      </div>

      <div className="field">
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
        <div className="char-row">
          <span className="char-hint">Mínimo: {limits.content.minLength} caracteres</span>
          <span className={`char-count ${contentVal.length >= limits.content.maxLength ? 'is-limit' : ''}`}>
            {contentVal.length}/{limits.content.maxLength}
          </span>
        </div>
        {errors.content && <small className="error">{errors.content.message}</small>}
      </div>

      <div className="grid">
        <div className="field">
          <label>Estado</label>
          <select {...register('status')}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        <div className="field">
          <label>{isEdit ? 'Nueva imagen (PNG/JPG)' : 'Imagen (PNG/JPG) *'}</label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            {...fileRegister}
            ref={mergedFileRef}
          />
          {formError && <small className="error">{formError}</small>}
        </div>
      </div>

      <div className="field">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            {...register('sendNewsletter')}
            style={{ cursor: 'pointer' }}
          />
          <span>📧 Enviar newsletter a suscriptores cuando se publique</span>
        </label>
        <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
          Si está marcado, se enviará un correo automático a todos los suscriptores cuando la noticia cambie a estado "Publicado"
        </small>
      </div>

      {preview && (
        <div className="preview">
          <img src={preview} alt="preview" />
        </div>
      )}

      <div className="actions">
        <button type="submit" disabled={!!submitting}>
          {submitting ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
