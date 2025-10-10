import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type {
  Entrepreneur,
  EntrepreneurUpdateData,
} from '../../Entrepreneurs/Services/EntrepreneursServices';
import {
  ENTREPRENEURSHIP_CATEGORIES,
  ENTREPRENEURSHIP_APPROACHES,
  transformUpdateDataToDto,
  useUpdateOwnEntrepreneur, // <<< NUEVO: usamos el endpoint público
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
  url_1: string | File;
  url_2: string | File;
  url_3: string | File;
  experience: string;
  facebook_url: string;
  instagram_url: string;
}) => ({
  name: t(form.name) || '',
  description: t(form.description) || '',
  location: t(form.location) || '',
  category: t(form.category) || '',
  approach: t(form.approach) || '',
  url_1: form.url_1 instanceof File ? form.url_1.name : (t(form.url_1) || ''),
  url_2: form.url_2 instanceof File ? form.url_2.name : (t(form.url_2) || ''),
  url_3: form.url_3 instanceof File ? form.url_3.name : (t(form.url_3) || ''),
  experience: String(form.experience ?? ''),
  facebook_url: t(form.facebook_url) || '',
  instagram_url: t(form.instagram_url) || '',
});

const MAX_NAME = 50;
const MIN_DESC = 80;
const MAX_DESC = 150;
const MAX_LOCATION = 150;

const EntrepreneurshipOnlyForm: React.FC<Props> = ({ entrepreneur, onSuccess }) => {
  const e = entrepreneur?.entrepreneurship;

  const [form, setForm] = useState<{
    name: string;
    description: string;
    location: string;
    category: string;
    approach: string;
    url_1: string | File;
    url_2: string | File;
    url_3: string | File;
    experience: string;
    facebook_url: string;
    instagram_url: string;
  }>({
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

  // States for image handling
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const [previewCache, setPreviewCache] = useState<{ [key: string]: string }>({});
  const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: string]: boolean }>({});

  const initRef = useRef(snapshot(form));
  // <<< CAMBIO: usar hook público con el ID del emprendedor
  const { mutateAsync, isPending, isError, error } = useUpdateOwnEntrepreneur(
    entrepreneur?.id_entrepreneur ?? 0
  );
  const [ok, setOk] = useState<string | null>(null);

  // Limpiar object URLs al desmontar el componente
  useEffect(() => {
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  // Función para convertir URL de Drive al formato proxy
  const getProxyImageUrl = useCallback((url: string): string => {
    if (!url) return '';

    // Si es un objeto URL (archivo nuevo), devolverlo tal cual
    if (url.startsWith('blob:')) return url;

    // Si ya es una URL de proxy, devolverla tal cual
    if (url.includes('/images/proxy')) return url;

    // Si es una URL de Google Drive, usar el proxy
    if (url.includes('drive.google.com')) {
      const baseUrl = 'http://localhost:3001';
      return `${baseUrl}/images/proxy?url=${encodeURIComponent(url)}`;
    }

    // Para otras URLs, devolver tal cual
    return url;
  }, []);

  // Función para obtener URL de fallback
  const getFallbackUrl = useCallback((url: string): string | null => {
    if (!url || !url.includes('drive.google.com')) return null;

    let fileId: string | null = null;
    const patterns = [
      /thumbnail\?id=([^&]+)/,
      /[?&]id=([^&]+)/,
      /\/d\/([^\/]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        fileId = match[1];
        break;
      }
    }

    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;
    }

    return null;
  }, []);

  // Precalcular las previews
  useEffect(() => {
    const newPreviewCache: { [key: string]: string } = {};
    const newObjectUrls: string[] = [];

    (['url_1', 'url_2', 'url_3'] as const).forEach((fieldName) => {
      const currentValue = form[fieldName];
      const existingUrl = entrepreneur.entrepreneurship?.[fieldName];

      let previewUrl: string | null = null;

      if (currentValue instanceof File) {
        const objectUrl = URL.createObjectURL(currentValue);
        newObjectUrls.push(objectUrl);
        previewUrl = objectUrl;
      } else if (typeof currentValue === 'string' && currentValue.trim() !== '') {
        previewUrl = currentValue;
      } else if (existingUrl && typeof existingUrl === 'string' && existingUrl.trim() !== '') {
        previewUrl = existingUrl;
      }

      if (previewCache[fieldName] && previewUrl) {
        newPreviewCache[fieldName] = previewUrl;
      } else if (previewUrl) {
        newPreviewCache[fieldName] = previewUrl;
      }
    });

    setPreviewCache(newPreviewCache);
    if (newObjectUrls.length > 0) {
      setObjectUrls(prev => [...prev, ...newObjectUrls]);
    }
  }, [
    form.url_1,
    form.url_2,
    form.url_3,
    entrepreneur.entrepreneurship?.url_1,
    entrepreneur.entrepreneurship?.url_2,
    entrepreneur.entrepreneurship?.url_3
  ]);

  const getPreview = useCallback((fieldName: 'url_1' | 'url_2' | 'url_3'): string | null => {
    return previewCache[fieldName] || null;
  }, [previewCache]);

  const handleProcessFile = useCallback((fieldName: 'url_1' | 'url_2' | 'url_3', file: File) => {
    // 1. Crear Blob URL para preview instantáneo
    const objectUrl = URL.createObjectURL(file);

    // 2. Actualizar form
    setForm(prev => ({ ...prev, [fieldName]: file }));

    // 3. ACTUALIZAR CACHÉ DE PREVIEW INSTANTÁNEAMENTE
    setPreviewCache(prev => ({
      ...prev,
      [fieldName]: objectUrl,
    }));

    // 4. Registrar URL para limpieza
    setObjectUrls(prev => [...prev, objectUrl]);

    // 5. Limpiar el error de carga para este campo
    setImageLoadErrors(prev => ({ ...prev, [fieldName]: false }));
  }, []);

  const handleReplaceImage = (fieldName: 'url_1' | 'url_2' | 'url_3') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Por favor selecciona un archivo de imagen válido (JPEG, PNG, etc.)');
          return;
        }
        handleProcessFile(fieldName, file);
      }
    };
    input.click();
  };

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

    // nombre con límite
    if (name === 'name') {
      setOk(null);
      setForm(prev => ({ ...prev, name: value.slice(0, MAX_NAME) }));
      return;
    }

    // descripción con límite
    if (name === 'description') {
      setOk(null);
      setForm(prev => ({ ...prev, description: value.slice(0, MAX_DESC) }));
      return;
    }

    // ubicación con límite
    if (name === 'location') {
      setOk(null);
      setForm(prev => ({ ...prev, location: value.slice(0, MAX_LOCATION) }));
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
      url_1: form.url_1 instanceof File ? form.url_1 : (form.url_1 || undefined),
      url_2: form.url_2 instanceof File ? form.url_2 : (form.url_2 || undefined),
      url_3: form.url_3 instanceof File ? form.url_3 : (form.url_3 || undefined),
    };

    const dto = transformUpdateDataToDto(updateData as EntrepreneurUpdateData);

    console.log('Update DTO:', dto);
    console.log('Has files?', dto.files && dto.files.length > 0);

    // <<< CAMBIO: llamar a la mutación pública (no admin)
    await mutateAsync(dto);

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

  const renderImageField = (fieldName: 'url_1' | 'url_2' | 'url_3', label: string, idx: number) => {
    const currentValue = form[fieldName];
    const previewUrl = getPreview(fieldName);
    const isNewFile = currentValue instanceof File;
    const hasError = imageLoadErrors[fieldName];

    let finalUrl = null;
    if (previewUrl) {
      if (isNewFile) {
        finalUrl = previewUrl;
      } else {
        finalUrl = getProxyImageUrl(previewUrl);
      }
    }

    return (
      <div key={fieldName} className="image-upload-container">
        <label>{label}</label>
        <div
          className="image-upload-box"
          onClick={() => !finalUrl && handleReplaceImage(fieldName)}
        >
          {finalUrl && !hasError ? (
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px'
            }}>
              <img
                src={finalUrl}
                alt={`Preview ${idx + 1}`}
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error(`Error loading image for ${fieldName}:`, finalUrl);
                  const target = e.currentTarget as HTMLImageElement;

                  if (!target.dataset.fallbackAttempted && previewUrl) {
                    target.dataset.fallbackAttempted = 'true';

                    const fallbackUrl = getFallbackUrl(previewUrl);
                    if (fallbackUrl && fallbackUrl !== finalUrl) {
                      console.log(`Trying fallback URL for ${fieldName}:`, fallbackUrl);
                      target.src = fallbackUrl;
                      return;
                    }
                  }

                  setImageLoadErrors(prev => ({ ...prev, [fieldName]: true }));
                }}
                onLoad={() => {
                  setImageLoadErrors(prev => ({ ...prev, [fieldName]: false }));
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplaceImage(fieldName);
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  padding: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                }}
                title="Reemplazar imagen"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                style={{ margin: '0 auto 12px', color: '#9ca3af' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={hasError ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"}
                />
              </svg>
              <div style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>
                {hasError
                  ? 'Error al cargar - Click para reintentar'
                  : finalUrl
                    ? 'Click para reemplazar imagen'
                    : `Click para subir imagen ${idx + 1}`
                }
              </div>
              {!hasError && !finalUrl && (
                <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  JPG, PNG o WEBP
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <form className="profile-form" onSubmit={onSubmit} style={{ minWidth: 0 }}>
      <h3 style={{ marginBottom: '1rem' }}>Información del Emprendimiento</h3>

      <div className="grid">
        <label className="field" style={{ gridColumn: '1 / -1' }}>
          <span>Nombre del Emprendimiento</span>
          <input name="name" value={form.name} onChange={onChange} maxLength={MAX_NAME} />
          <small style={{ display: 'block', marginTop: 6, color: '#6b7280' }}>
            {form.name.length}/{MAX_NAME}
          </small>
        </label>

        <label className="field" style={{ gridColumn: '1 / -1' }}>
          <span>Descripción</span>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            maxLength={MAX_DESC}
            minLength={MIN_DESC}
            rows={4}
            placeholder={`Mínimo ${MIN_DESC} caracteres, máximo ${MAX_DESC} caracteres`}
          />
          <small style={{ display: 'block', marginTop: 6, color: '#6b7280' }}>
            {form.description.length}/{MAX_DESC} (mínimo {MIN_DESC})
          </small>
        </label>

        <label className="field">
          <span>Ubicación</span>
          <input name="location" value={form.location} onChange={onChange} maxLength={MAX_LOCATION} />
          <small style={{ display: 'block', marginTop: 6, color: '#6b7280' }}>
            {form.location.length}/{MAX_LOCATION}
          </small>
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
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Imágenes del Emprendimiento</h4>
        <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
          Puedes ver las imágenes actuales y reemplazarlas si es necesario.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {renderImageField('url_1', 'Imagen 1', 0)}
          {renderImageField('url_2', 'Imagen 2', 1)}
          {renderImageField('url_3', 'Imagen 3', 2)}
        </div>
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
