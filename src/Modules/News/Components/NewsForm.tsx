import React from 'react';
import { useForm } from 'react-hook-form';
import type { CreateNewsInput, NewsStatus } from '../Services/NewsServices';
import '../Styles/NewsForm.css';

type Props = {
  defaultValues?: Partial<CreateNewsInput>;
  onSubmit: (data: CreateNewsInput) => void;
  submitting?: boolean;
};

// RHF usa FileList para inputs de archivo
type FormValues = Omit<CreateNewsInput, 'file'> & { file?: FileList };

const IMG_OK = ['image/png', 'image/jpeg'];
const hasExt = (name: string, exts: string[]) => exts.some((e) => name.toLowerCase().endsWith(e));

export default function NewsForm({ defaultValues, onSubmit, submitting }: Props) {
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
    <form onSubmit={submit} className="news-form">
      <div className="grid">
        <div className="field">
          <label>Título *</label>
          <input
            {...register('title', { required: 'Requerido' })}
            placeholder="Título de la noticia"
          />
          {errors.title && <small className="error">{errors.title.message}</small>}
        </div>

        <div className="field">
          <label>Autor *</label>
          <input
            {...register('author', { required: 'Requerido' })}
            placeholder="Nombre del autor"
          />
          {errors.author && <small className="error">{errors.author.message}</small>}
        </div>
      </div>

      <div className="field">
        <label>Contenido *</label>
        <textarea
          rows={8}
          {...register('content', { required: 'Requerido' })}
          placeholder="Escribe el contenido"
        />
        {errors.content && <small className="error">{errors.content.message}</small>}
      </div>

      <div className="grid">
        <div className="field">
          <label>Estado</label>
          <select {...register('status')}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>

        <div className="field">
          <label>{isEdit ? 'Nueva imagen (PNG/JPG) — opcional' : 'Imagen (PNG/JPG) *'}</label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            {...fileRegister}
            ref={mergedFileRef}
          />
          {formError && <small className="error">{formError}</small>}
        </div>
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
