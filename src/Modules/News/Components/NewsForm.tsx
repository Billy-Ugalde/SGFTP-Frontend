// src/Modules/News/Components/NewsForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddNews, useUpdateNews } from '../Services/NewsServices';
import '../Styles/News.css';

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: any | null; // News | null
};

type FormValues = {
  title: string;
  content: string;
  imageUrl?: string;
  imageFile?: FileList;
};

/** Definimos el DTO localmente para no depender del tipo del servicio */
type CreateNewsDto = {
  title: string;
  content: string;
  imageUrl?: string;
  imageFile?: File | undefined;
};

const TITLE_MAX = 120;
const CONTENT_MAX = 5000;
const FILE_MAX_MB = 3;
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];

export default function NewsForm({ open, onClose, initial }: Props) {
  const isEdit = !!initial?.id;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      title: initial?.title ?? '',
      content: initial?.content ?? '',
      imageUrl: initial?.imageUrl ?? '',
    },
  });

  const addMut = useAddNews();
  /**
   * Si tu hook useUpdateNews exige un id en la inicialización,
   * casteamos de manera segura. Si NO lo exige, cámbialo a:
   *    const updMut = useUpdateNews();
   * y más abajo pasa el id a mutateAsync.
   */
  const updMut = useUpdateNews(isEdit ? Number(initial!.id) : (0 as number));


  const [submitting, setSubmitting] = useState(false);

  const contentVal = watch('content') ?? '';

  const onSubmit = async (values: FormValues) => {
    const files = values.imageFile?.length ? Array.from(values.imageFile) : [];
    if (files.length) {
      const f = files[0];
      const tooBig = f.size > FILE_MAX_MB * 1024 * 1024;
      const badType = !ACCEPT.includes(f.type);
      if (badType) {
        // Mensaje visible en UI
        alert('Formatos válidos: JPG, PNG, WEBP');
        return;
      }
      if (tooBig) {
        alert(`El archivo supera ${FILE_MAX_MB} MB`);
        return;
      }
    }

    const payload: CreateNewsDto = {
      title: values.title.trim(),
      content: values.content.trim(),
      // Si adjunta archivo, el backend reemplaza la URL por la de Drive
      imageUrl: values.imageUrl?.trim() || undefined,
      imageFile: files.length ? files[0] : undefined,
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        // Opción A (hook con id al inicializar):
        await updMut.mutateAsync(payload as any);

        // Opción B (si tu hook NO usa id al inicializar, usa esta en su lugar):
        // await updMut.mutateAsync({ id: initial.id, ...payload } as any);
      } else {
        await addMut.mutateAsync(payload as any);
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        {/* HEADER */}
        <div className="modal__header">
          <h3>{isEdit ? 'Editar noticia' : 'Nueva noticia'}</h3>
          <button className="btn btn--ghost" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            {/* Título */}
            <div className="form-control col-12">
              <label htmlFor="title">Título</label>
              <input
                id="title"
                type="text"
                placeholder="Título de la noticia"
                {...register('title', {
                  required: 'El título es obligatorio',
                  maxLength: { value: TITLE_MAX, message: `Máx. ${TITLE_MAX} caracteres` },
                })}
              />
              {errors.title && <span className="form-error">{errors.title.message}</span>}
            </div>

            {/* Contenido */}
            <div className="form-control col-12">
              <label htmlFor="content">Contenido</label>
              <textarea
                id="content"
                rows={6}
                placeholder="Contenido de la noticia…"
                {...register('content', {
                  required: 'El contenido es obligatorio',
                  maxLength: { value: CONTENT_MAX, message: `Máx. ${CONTENT_MAX} caracteres` },
                })}
              />
              <div className="hint">{contentVal.length}/{CONTENT_MAX}</div>
              {errors.content && <span className="form-error">{errors.content.message}</span>}
            </div>

            {/* Imagen URL */}
            <div className="form-control col-8">
              <label htmlFor="imageUrl">Imagen (URL)</label>
              <input
                id="imageUrl"
                type="url"
                placeholder="https://…"
                {...register('imageUrl', {
                  pattern: {
                    value: /^https?:\/\/.+/i,
                    message: 'Debe ser una URL válida (http/https)',
                  },
                })}
              />
              <div className="hint">Si adjuntas archivo, la URL será reemplazada por la de Drive.</div>
              {errors.imageUrl && <span className="form-error">{errors.imageUrl.message}</span>}
            </div>

            {/* Imagen archivo */}
            <div className="form-control col-4">
              <label htmlFor="imageFile">Imagen (archivo)</label>
              <input
                id="imageFile"
                type="file"
                accept={ACCEPT.join(',')}
                {...register('imageFile', {
                  validate: (files) => {
                    if (!files || !files.length) return true;
                    const f = files[0];
                    if (!ACCEPT.includes(f.type)) return 'Formatos: JPG, PNG, WEBP';
                    if (f.size > FILE_MAX_MB * 1024 * 1024) return `Máx: ${FILE_MAX_MB} MB`;
                    return true;
                  },
                })}
              />
              <div className="hint">Formatos: JPG, PNG, WEBP · Máx: {FILE_MAX_MB} MB</div>
              {errors.imageFile && <span className="form-error">{errors.imageFile.message as string}</span>}
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn--back"
              disabled={submitting || (!isValid && !isEdit)}
            >
              {isEdit ? 'Guardar cambios' : 'Crear noticia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
