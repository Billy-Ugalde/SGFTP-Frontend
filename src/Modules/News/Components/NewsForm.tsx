import React from 'react';
import { useForm } from 'react-hook-form';
import type { CreateNewsInput, NewsStatus } from '../Services/NewsServices';
import '../Styles/NewsForm.css';

type Props = {
  defaultValues?: Partial<CreateNewsInput>;
  onSubmit: (data: CreateNewsInput) => void;
  submitting?: boolean;
};

export default function NewsForm({ defaultValues, onSubmit, submitting }: Props) {
  const { register, handleSubmit, formState: { errors } } =
    useForm<CreateNewsInput>({
      defaultValues: {
        title: defaultValues?.title || '',
        author: defaultValues?.author || '',
        content: defaultValues?.content || '',
        status: (defaultValues?.status as NewsStatus) || 'draft',
        image_url: defaultValues?.image_url ?? '',
        // 👇 RHF manejará el file como FileList; no lo ponemos en defaults
      },
    });

  // Pequeña ayuda para mostrar error de tipo de archivo
  const [fileError, setFileError] = React.useState<string | null>(null);

  const submit = handleSubmit(vals => {
    setFileError(null);

    // Recuperar el archivo (RHF guarda FileList en vals['file'])
    const fileList = (vals as any).file as FileList | undefined;
    const file = fileList && fileList.length ? fileList[0] : undefined;

    // Si el usuario seleccionó archivo, validar PNG/JPG
    if (file) {
      const okType =
        file.type === 'image/png' ||
        file.type === 'image/jpeg' ||
        /\.png$/i.test(file.name) ||
        /\.jpe?g$/i.test(file.name);
      if (!okType) {
        setFileError('La imagen debe ser PNG o JPG.');
        return;
      }
    }

    // Construimos el payload manteniendo exactamente tu shape actual
    const payload: any = {
      title: vals.title.trim(),
      author: vals.author.trim(),
      content: vals.content.trim(),
      status: vals.status as NewsStatus,
      image_url: vals.image_url.trim(), // ✅ requerido
    };

    // 👇 Solo añadimos el archivo si existe; el service lo enviará como 'file'
    if (file) payload.file = file;

    // Si tu CreateNewsInput ya declara `file?: File`, puedes quitar el `any`.
    onSubmit(payload as CreateNewsInput);
  });

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
          <label>URL de imagen (requerida)</label>
          <input
            {...register('image_url', {
              required: 'La URL de la imagen es obligatoria',
              pattern: {
                value: /^(https?:\/\/)/i,
                message: 'Debe ser una URL válida (http/https)',
              },
            })}
            placeholder="https://..."
          />
          {errors.image_url && <small className="error">{errors.image_url.message}</small>}
        </div>
      </div>

      {/* 👇 ÚNICO agregado: input de archivo para subir a Drive (opcional) */}
      <div className="field">
        <label>Subir imagen (PNG/JPG) — opcional</label>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          {...register('file' as any)}
        />
        {fileError && <small className="error">{fileError}</small>}
      </div>

      <div className="actions">
        <button type="submit" disabled={!!submitting}>
          {submitting ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
