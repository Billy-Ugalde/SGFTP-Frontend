import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  Entrepreneur,
  EntrepreneurUpdateData,
} from '../../Entrepreneurs/Services/EntrepreneursServices';
import {
  ENTREPRENEURSHIP_CATEGORIES,
  ENTREPRENEURSHIP_APPROACHES,
  useUpdateEntrepreneur,
  transformUpdateDataToDto,
} from '../../Entrepreneurs/Services/EntrepreneursServices';

type Props = {
  entrepreneur: Entrepreneur;
  onSuccess?: () => void;
};

const t = (v: any) => (typeof v === 'string' ? v.trim() : v);

// Lee experience como lo hace admin
const readExperience = (ent?: Entrepreneur): string => {
  const raw =
    (ent as any)?.experience ??
    (ent as any)?.entrepreneur?.experience ??
    '';
  return raw === null || raw === undefined ? '' : String(raw);
};

const toIntOrNull = (s: string): number | null => {
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

/* ===================== Validadores de redes ===================== */
function parseWithProto(url: string): URL | null {
  const s = (url || '').trim();
  if (!s) return null;
  try {
    return new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }
}

const FB_HOSTS = ['facebook.com', 'm.facebook.com', 'fb.com'];
const IG_HOSTS = ['instagram.com', 'instagr.am'];

function hostEndsWith(host: string, allowed: string[]) {
  const h = host.toLowerCase().replace(/^www\./, '');
  return allowed.some((d) => h === d || h.endsWith(`.${d}`));
}

function isValidFacebookUrl(value?: string) {
  if (!value || !value.trim()) return true; // vacío es válido
  const u = parseWithProto(value);
  return !!u && hostEndsWith(u.hostname, FB_HOSTS);
}

function isValidInstagramUrl(value?: string) {
  if (!value || !value.trim()) return true; // vacío es válido
  const u = parseWithProto(value);
  return !!u && hostEndsWith(u.hostname, IG_HOSTS);
}

/* =============== Snapshot para detectar cambios reales =============== */
const snapshot = (form: {
  name: string;
  description: string;
  location: string;
  category: string;
  approach: string;
  url_1: string;
  url_2: string;
  url_3: string;
  experience: string;
  facebook_url: string;
  instagram_url: string;
}) => ({
  name: t(form.name) || '',
  description: t(form.description) || '',
  location: t(form.location) || '',
  category: t(form.category) || '',
  approach: t(form.approach) || '',
  url_1: t(form.url_1) || '',
  url_2: t(form.url_2) || '',
  url_3: t(form.url_3) || '',
  experience: String(form.experience ?? ''),
  facebook_url: t(form.facebook_url) || '',
  instagram_url: t(form.instagram_url) || '',
});

const MAX_DESC = 80;

const EntrepreneurshipOnlyForm: React.FC<Props> = ({ entrepreneur, onSuccess }) => {
  const e = entrepreneur?.entrepreneurship;

  const [form, setForm] = useState({
    name: e?.name || '',
    description: e?.description || '',
    location: e?.location || '',
    category: (e?.category as string) || 'Comida',
    approach: (e?.approach as string) || 'social',
    url_1: e?.url_1 || '',
    url_2: e?.url_2 || '',
    url_3: e?.url_3 || '',
    experience: readExperience(entrepreneur),
    facebook_url: entrepreneur?.facebook_url || '',
    instagram_url: entrepreneur?.instagram_url || '',
  });

  // Errores de validación
  const [fbErr, setFbErr] = useState<string>('');
  const [igErr, setIgErr] = useState<string>('');

  const initRef = useRef(snapshot(form));
  const { mutateAsync, isPending, isError, error } = useUpdateEntrepreneur();
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    const ee = entrepreneur?.entrepreneurship;
    const next = {
      name: ee?.name || '',
      description: ee?.description || '',
      location: ee?.location || '',
      category: (ee?.category as string) || 'Comida',
      approach: (ee?.approach as string) || 'social',
      url_1: ee?.url_1 || '',
      url_2: ee?.url_2 || '',
      url_3: ee?.url_3 || '',
      experience: readExperience(entrepreneur),
      facebook_url: entrepreneur?.facebook_url || '',
      instagram_url: entrepreneur?.instagram_url || '',
    };
    setForm(next);
    initRef.current = snapshot(next);
    setFbErr('');
    setIgErr('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrepreneur?.id_entrepreneur]);

  const onChange = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = ev.target;

    // descripción con límite
    if (name === 'description') {
      setOk(null);
      setForm(prev => ({ ...prev, description: value.slice(0, MAX_DESC) }));
      return;
    }

    setOk(null);
    setForm((prev) => ({ ...prev, [name]: value }));

    // validar redes en caliente
    if (name === 'facebook_url') {
      setFbErr(isValidFacebookUrl(value) ? '' : 'Debe ser un enlace de Facebook (facebook.com).');
    } else if (name === 'instagram_url') {
      setIgErr(isValidInstagramUrl(value) ? '' : 'Debe ser un enlace de Instagram (instagram.com).');
    }
  };

  const isDirty = useMemo(() => {
    const now = JSON.stringify(snapshot(form));
    const prev = JSON.stringify(initRef.current);
    return now !== prev;
  }, [form]);

  const hasSocialErrors = fbErr !== '' || igErr !== '';

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!entrepreneur?.id_entrepreneur || !isDirty) return;

    // Validación final antes de enviar
    const fbOk = isValidFacebookUrl(form.facebook_url);
    const igOk = isValidInstagramUrl(form.instagram_url);
    setFbErr(fbOk ? '' : 'Debe ser un enlace de Facebook (facebook.com).');
    setIgErr(igOk ? '' : 'Debe ser un enlace de Instagram (instagram.com).');
    if (!fbOk || !igOk) return;

    const updateData: Partial<EntrepreneurUpdateData> = {
      experience: toIntOrNull(form.experience) ?? 0,
      // ahora mandamos lo que está en el formulario
      facebook_url: form.facebook_url,
      instagram_url: form.instagram_url,
      entrepreneurship_name: form.name,
      description: (form.description ?? '').slice(0, MAX_DESC),
      location: form.location,
      category: form.category as any,
      approach: form.approach as any,
      url_1: form.url_1,
      url_2: form.url_2,
      url_3: form.url_3,
    };

    const dto = transformUpdateDataToDto(updateData as EntrepreneurUpdateData);

    await mutateAsync({
      id_entrepreneur: entrepreneur.id_entrepreneur!,
      ...dto,
    });

    initRef.current = snapshot({
      ...form,
      description: (form.description ?? '').slice(0, MAX_DESC),
    });
    setOk('Emprendimiento actualizado correctamente.');
    onSuccess?.();
  };

  const friendlyError =
    (error as any)?.response?.data?.message ||
    (error as any)?.message ||
    'No se pudo actualizar';

  return (
    <form className="profile-form" onSubmit={onSubmit} style={{ minWidth: 0 }}>
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
            maxLength={MAX_DESC}
            style={{ width: '100%', height: '45px', resize: 'none', overflow: 'auto' }}
            placeholder={`Máximo ${MAX_DESC} caracteres`}
          />
          <small style={{ display: 'block', marginTop: 6, color: '#6b7280' }}>
            {form.description.length}/{MAX_DESC}
          </small>
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

        <label className="field">
          <span>Años de experiencia</span>
          <input
            name="experience"
            type="number"
            min={0}
            max={100}
            value={form.experience}
            onChange={onChange}
            placeholder="0"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </label>

        {/* ===== Redes sociales (validación por dominio) ===== */}
        <label className="field" style={{ gridColumn: '1 / -1' }}>
          <span>Facebook (opcional)</span>
          <input
            name="facebook_url"
            value={form.facebook_url}
            onChange={onChange}
            placeholder="https://facebook.com/tu-pagina"
          />
          {fbErr && (
            <small style={{ color: '#dc2626', marginTop: 6, display: 'block' }}>
              {fbErr}
            </small>
          )}
        </label>

        <label className="field" style={{ gridColumn: '1 / -1' }}>
          <span>Instagram (opcional)</span>
          <input
            name="instagram_url"
            value={form.instagram_url}
            onChange={onChange}
            placeholder="https://instagram.com/tu-cuenta"
          />
          {igErr && (
            <small style={{ color: '#dc2626', marginTop: 6, display: 'block' }}>
              {igErr}
            </small>
          )}
        </label>
        {/* =================================================== */}

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
        <button
          type="submit"
          className="save-btn"
          disabled={!isDirty || isPending || hasSocialErrors}
          title={hasSocialErrors ? 'Corrige los enlaces de redes sociales' : undefined}
        >
          {isPending ? 'Guardando…' : 'Actualizar Emprendimiento'}
        </button>
      </div>

      {ok && (
        <div className="profile-ok" style={{ marginTop: 12 }}>
          {ok}
        </div>
      )}

      {isError && (
        <div className="profile-error" style={{ marginTop: 12 }}>
          {Array.isArray(friendlyError) ? friendlyError.join(', ') : friendlyError}
        </div>
      )}
    </form>
  );
};

export default EntrepreneurshipOnlyForm;
