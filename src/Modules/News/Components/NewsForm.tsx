import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  useAddNews, useNewsOne, useUpdateNews,
  type CreateNewsDto, type UpdateNewsDto
} from '../Services/NewsServices';
import GenericModal from '../../Fairs/Components/GenericModal'; // reusamos el marco del modal
import '../Styles/NewsForm.css';

interface Props {
  mode: 'create' | 'edit';
  id_news?: number;
  onClose: () => void;
}

const EMPTY: CreateNewsDto = { title: '', content: '', author: '', image_url: '' };

const norm = (v: any) => (typeof v === 'string' ? v.trim() : v ?? '');
const shallowEqualNorm = (a: any, b: any) => {
  const ka = Object.keys(a ?? {}), kb = Object.keys(b ?? {});
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (norm(a[k]) !== norm(b[k])) return false;
  return true;
};

const TITLE_MAX = 180;
const AUTHOR_MAX = 120;
const CONTENT_MAX = 4000;

const NewsForm: React.FC<Props> = ({ mode, id_news, onClose }) => {
  const isEdit = mode === 'edit';
  const { data } = useNewsOne(isEdit ? id_news : undefined);

  const [form, setForm] = useState<CreateNewsDto | UpdateNewsDto>(EMPTY);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const addMut = useAddNews();
  const updMut = useUpdateNews(id_news ?? 0);

  const initialRef = useRef<CreateNewsDto | UpdateNewsDto>(EMPTY);

  useEffect(() => {
    if (isEdit && data) {
      const init = {
        title: data.title, content: data.content, author: data.author,
        image_url: data.image_url || '',
      };
      initialRef.current = init;
      setForm(init);
    } else if (!isEdit) {
      initialRef.current = EMPTY;
      setForm(EMPTY);
    }
  }, [isEdit, data]);

  const isDirty = useMemo(() => {
    const baseChanged = !shallowEqualNorm(initialRef.current, form);
    const fileChanged = !!file;
    return baseChanged || fileChanged;
  }, [form, file]);

  const saving = addMut.isPending || updMut.isPending;

  const getCountClass = (len: number, max: number) => {
    if (len > max) return 'news-form__character-count news-form__character-count--error';
    if (len > Math.floor(max * 0.9)) return 'news-form__character-count news-form__character-count--warn';
    return 'news-form__character-count';
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.title?.trim()) return setErrorMsg('El título es requerido.');
    if (!form.content?.trim()) return setErrorMsg('El contenido es requerido.');
    if (!form.author?.trim()) return setErrorMsg('El autor es requerido.');
    if ((form.title?.length ?? 0) > TITLE_MAX) return setErrorMsg('El título excede el máximo permitido.');
    if ((form.author?.length ?? 0) > AUTHOR_MAX) return setErrorMsg('El autor excede el máximo permitido.');
    if ((form.content?.length ?? 0) > CONTENT_MAX) return setErrorMsg('El contenido excede el máximo permitido.');
    if (!isDirty) return setErrorMsg('No hay cambios para guardar.');

    try {
      if (isEdit) await updMut.mutateAsync({ dto: form as UpdateNewsDto, file });
      else await addMut.mutateAsync({ dto: form as CreateNewsDto, file });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message ?? err?.message ?? 'Error guardando la noticia');
    }
  };

  return (
    <GenericModal show={true} onClose={onClose} title={isEdit ? 'Editar noticia' : 'Nueva noticia'} size="md">
      <form className="news-form" onSubmit={(e) => { void submit(e); }}>
        {errorMsg && (
          <div className="news-form__error">
            <div className="news-form__error-icon">!</div>
            <div className="news-form__error-text">{errorMsg}</div>
          </div>
        )}

        <div className="news-form__grid">
          <div className="span-1">
            <label className="news-form__label">
              Título <span className="news-form__required">campo obligatorio</span>
            </label>
            <input
              value={form.title || ''}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={TITLE_MAX + 1}
              required
              className="news-form__input"
            />
            <div className="news-form__field-info">
              <div className={getCountClass((form.title || '').length, TITLE_MAX)}>
                {(form.title || '').length}/{TITLE_MAX} caracteres
              </div>
            </div>
          </div>

          <div className="span-1">
            <label className="news-form__label">
              Autor <span className="news-form__required">campo obligatorio</span>
            </label>
            <input
              value={form.author || ''}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              maxLength={AUTHOR_MAX + 1}
              required
              className="news-form__input"
            />
            <div className="news-form__field-info">
              <div className={getCountClass((form.author || '').length, AUTHOR_MAX)}>
                {(form.author || '').length}/{AUTHOR_MAX} caracteres
              </div>
            </div>
          </div>

          <div className="span-2">
            <label className="news-form__label">
              Contenido <span className="news-form__required">campo obligatorio</span>
            </label>
            <textarea
              value={form.content || ''}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={6}
              required
              className="news-form__textarea"
            />
            <div className="news-form__field-info">
              <div className={getCountClass((form.content || '').length, CONTENT_MAX)}>
                {(form.content || '').length}/{CONTENT_MAX} caracteres
              </div>
            </div>
          </div>

          <div className="span-1">
            <label className="news-form__label">Imagen (subir archivo)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0])}
              className="news-form__file"
            />
            <small className="news-form__hint">Si adjuntas archivo, se sube a Drive y se actualiza la URL automáticamente.</small>
          </div>

          <div className="span-1">
            <label className="news-form__label">o URL de imagen (opcional)</label>
            <input
              placeholder="https://..."
              value={(form as any).image_url || ''}
              onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              className="news-form__input"
            />
          </div>
        </div>

        <div className="news-form__actions">
          <button type="button" className="secondary-btn" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="primary-btn" type="submit" disabled={!isDirty || saving}>
            {isEdit ? 'Guardar cambios' : 'Crear noticia'}
          </button>
        </div>
      </form>
    </GenericModal>
  );
};

export default NewsForm;
