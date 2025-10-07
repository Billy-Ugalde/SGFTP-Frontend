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
      },
    });

  const submit = handleSubmit(vals => {
    onSubmit({
      title: vals.title.trim(),
      author: vals.author.trim(),
      content: vals.content.trim(),
      status: vals.status as NewsStatus,
      image_url: vals.image_url.trim(), // requerido
    });
  });

  return (
    <form onSubmit={submit} className="news-form">
      <div className="grid">
        <div className="field">
          <label>Título *</label>
          <input
            {...register('title', { required: 'Requerido' })}
            placeholder="Título de la noticia"
            autoComplete="off"
            aria-invalid={!!errors.title}
          />
          {errors.title && <small className="error">{errors.title.message}</small>}
        </div>

        <div className="field">
          <label>Autor *</label>
          <input
            {...register('author', { required: 'Requerido' })}
            placeholder="Nombre del autor"
            autoComplete="off"
            aria-invalid={!!errors.author}
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
          aria-invalid={!!errors.content}
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
            type="url"
            inputMode="url"
            {...register('image_url', {
              required: 'La URL de la imagen es obligatoria',
              pattern: {
                value: /^(https?:\/\/)/i,
                message: 'Debe ser una URL válida (http/https)',
              },
            })}
            placeholder="https://..."
            aria-invalid={!!errors.image_url}
          />
          {errors.image_url && <small className="error">{errors.image_url.message}</small>}
        </div>
      </div>

      <div className="actions">
        <button type="submit" disabled={!!submitting}>
          {submitting ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
