import React, { useState } from 'react';
import type {
  Entrepreneur,
  UpdateCompleteEntrepreneurDto,
} from '../../Entrepreneurs/Services/EntrepreneursServices';
import {
  useUpdateEntrepreneurPublic,
  ENTREPRENEURSHIP_CATEGORIES,
  ENTREPRENEURSHIP_APPROACHES,
} from '../../Entrepreneurs/Services/EntrepreneursServices';

type Props = {
  entrepreneur: Entrepreneur;
  onSuccess?: () => void;
};

const EntrepreneurshipOnlyForm: React.FC<Props> = ({
  entrepreneur,
  onSuccess,
}) => {
  const e = entrepreneur?.entrepreneurship;

  const [form, setForm] = useState({
    name: e?.name || '',
    description: e?.description || '',
    location: e?.location || '',
    category: e?.category || 'Comida',
    approach: e?.approach || 'social',
    url_1: e?.url_1 || '',
    url_2: e?.url_2 || '',
    url_3: e?.url_3 || '',
  });

  const { mutateAsync, isPending, isError, error } =
    useUpdateEntrepreneurPublic();

  const onChange = (
    ev: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = ev.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!entrepreneur?.id_entrepreneur) return;

    const payload: UpdateCompleteEntrepreneurDto = {
      entrepreneurship: {
        name: form.name,
        description: form.description,
        location: form.location,
        category: form.category as any,
        approach: form.approach as any,
        url_1: form.url_1 || undefined,
        url_2: form.url_2 || undefined,
        url_3: form.url_3 || undefined,
      },
    };

    await mutateAsync({
      id_entrepreneur: entrepreneur.id_entrepreneur!,
      ...payload,
    });
    onSuccess?.();
  };

  const friendlyError =
    (error as any)?.response?.data?.message ||
    (error as any)?.message ||
    'No se pudo actualizar';

  return (
    <form className="profile-form" onSubmit={onSubmit}>
      <h3 style={{ marginBottom: '1rem' }}>Información del Emprendimiento</h3>

      <div className="grid">
        <label className="field" style={{ gridColumn: '1 / -1' }}>
          <span>Nombre del Emprendimiento</span>
          <input name="name" value={form.name} onChange={onChange} />
        </label>

        <label className="field" style={{ gridColumn: '1 / -1' }}>
          <span>Descripción</span>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={4}
          />
        </label>

        <label className="field">
          <span>Ubicación</span>
          <input name="location" value={form.location} onChange={onChange} />
        </label>

        <label className="field">
          <span>Categoría</span>
          <select name="category" value={form.category} onChange={onChange}>
            {ENTREPRENEURSHIP_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Enfoque</span>
          <select name="approach" value={form.approach} onChange={onChange}>
            {ENTREPRENEURSHIP_APPROACHES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field" style={{ gridColumn: '1 / -1' }}>
          <span>URL Imagen 1</span>
          <input
            name="url_1"
            value={form.url_1}
            onChange={onChange}
            placeholder="https://..."
          />
        </label>

        <label className="field" style={{ gridColumn: '1 / -1' }}>
          <span>URL Imagen 2</span>
          <input
            name="url_2"
            value={form.url_2}
            onChange={onChange}
            placeholder="https://..."
          />
        </label>

        <label className="field" style={{ gridColumn: '1 / -1' }}>
          <span>URL Imagen 3</span>
          <input
            name="url_3"
            value={form.url_3}
            onChange={onChange}
            placeholder="https://..."
          />
        </label>
      </div>

      <div className="actions">
        <button type="submit" className="save-btn" disabled={isPending}>
          {isPending ? 'Guardando…' : 'Actualizar Emprendimiento'}
        </button>
      </div>

      {isError && (
        <div className="profile-error" style={{ marginTop: 12 }}>
          {Array.isArray(friendlyError) ? friendlyError.join(', ') : friendlyError}
        </div>
      )}
    </form>
  );
};

export default EntrepreneurshipOnlyForm;
