import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getPersonById, updatePerson, type UpdatePersonPayload } from '../services/profileService';

type Props = {
  personId: number;
  onSaved?: () => Promise<void> | void;
};

type PhoneRow = { number: string; type?: string; is_primary?: boolean };

// Tipos concretos usados por la API para teléfonos
type ApiPhoneType = 'personal' | 'business';
type ApiPhone = { number: string; type: ApiPhoneType; is_primary?: boolean };

const onlyDigits = (s?: string) => (s ?? '').replace(/\D/g, '');
const trimmed = (v: any) => (typeof v === 'string' ? v.trim() : v);

const normalizePhonesToFixed = (phones: any[] = []): PhoneRow[] => {
  const principal = phones.find(p => p?.is_primary) || phones[0] || {};
  const business  = phones.find(p => {
    const t = String(p?.type ?? '').toLowerCase();
    return t === 'business' || t === 'work';
  }) || {};
  return [
    { number: principal?.number ?? '', type: 'personal',  is_primary: true  },
    { number: business?.number ?? '',  type: 'business',  is_primary: false },
  ];
};

// Snapshot sin redes para detección de cambios
const buildComparableSnapshot = (form: any) => ({
  first_name: trimmed(form.first_name) ?? '',
  second_name: trimmed(form.second_name) ?? '',
  first_lastname: trimmed(form.first_lastname) ?? '',
  second_lastname: trimmed(form.second_lastname) ?? '',
  email: trimmed(form.email) ?? '',
  phones: [
    { number: trimmed(form.phones?.[0]?.number) ?? '', type: 'personal',  is_primary: true  },
    { number: trimmed(form.phones?.[1]?.number) ?? '', type: 'business',  is_primary: false },
  ],
});

const ProfilePersonalForm: React.FC<Props> = ({ personId, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    first_name: '',
    second_name: '',
    first_lastname: '',
    second_lastname: '',
    email: '',
    phones: [] as PhoneRow[],
    // Se mantienen en estado por si llegan del backend, pero NO se muestran ni se envían
    facebook: '',
    instagram: '',
  });

  const lastSavedRef = useRef(buildComparableSnapshot(form));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getPersonById(personId);
        if (!mounted) return;

        const next = {
          first_name: data?.first_name ?? '',
          second_name: data?.second_name ?? '',
          first_lastname: data?.first_lastname ?? '',
          second_lastname: data?.second_lastname ?? '',
          email: data?.email ?? '',
          phones: normalizePhonesToFixed(data?.phones),
          facebook: data?.facebook ?? '',
          instagram: data?.instagram ?? '',
        };

        setForm(next);
        lastSavedRef.current = buildComparableSnapshot(next);
        setHydrated(true);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? 'No se pudo cargar la información personal');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [personId]);

  const isDirty = useMemo(() => {
    if (!hydrated) return false;
    const now = JSON.stringify(buildComparableSnapshot(form));
    const prev = JSON.stringify(lastSavedRef.current);
    return now !== prev;
  }, [form, hydrated]);

  const hasValidationErrors = useMemo(() => {
    return Object.keys(fieldErrors).length > 0;
  }, [fieldErrors]);

  const canSubmit = useMemo(() => {
    return hydrated && isDirty && !hasValidationErrors && !saving && !isButtonDisabled;
  }, [hydrated, isDirty, hasValidationErrors, saving, isButtonDisabled]);

  const validateField = (name: string, value: string): string | null => {
    // Limpiar error previo
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });

    switch (name) {
      case 'first_name':
        if (!value.trim()) return 'El primer nombre es requerido';
        if (value.trim().length < 2) return 'Mínimo 2 caracteres';
        if (value.length > 50) return 'Máximo 50 caracteres';
        break;
      case 'second_name':
        if (value.trim() && value.trim().length < 2) return 'Mínimo 2 caracteres';
        if (value.length > 50) return 'Máximo 50 caracteres';
        break;
      case 'first_lastname':
        if (!value.trim()) return 'El primer apellido es requerido';
        if (value.trim().length < 2) return 'Mínimo 2 caracteres';
        if (value.length > 50) return 'Máximo 50 caracteres';
        break;
      case 'second_lastname':
        if (!value.trim()) return 'El segundo apellido es requerido';
        if (value.trim().length < 2) return 'Mínimo 2 caracteres';
        if (value.length > 50) return 'Máximo 50 caracteres';
        break;
      case 'email':
        if (!value.trim()) return 'El correo electrónico es requerido';
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          return 'Formato de correo inválido';
        }
        if (value.length > 150) return 'Máximo 150 caracteres';
        break;
    }
    return null;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOk(null);
    setError(null);

    const fieldError = validateField(name, value);
    if (fieldError) {
      setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validatePhone = (value: string, fieldName: string): string | null => {
    // Limpiar error previo
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });

    if (value.trim() && !/^[\+]?[\d\s\-\(\)]+$/.test(value)) {
      return 'Solo números, espacios, guiones, paréntesis y + son permitidos';
    }
    if (value.length > 20) {
      return 'Máximo 20 caracteres';
    }
    return null;
  };

  const onPhoneChange = (index: 0 | 1, value: string) => {
    setOk(null);
    setError(null);

    const fieldName = `phone_${index === 0 ? 'personal' : 'business'}`;
    const phoneError = validatePhone(value, fieldName);
    if (phoneError) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: phoneError }));
    }

    setForm(prev => ({
      ...prev,
      phones: prev.phones.map((p, i) => (i === index ? { ...p, number: value } : p)),
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;

    // Validar todos los campos antes de enviar
    const errors: Record<string, string> = {};

    // Validar campos de texto
    if (!form.first_name.trim()) {
      errors.first_name = 'El primer nombre es requerido';
    } else if (form.first_name.trim().length < 2) {
      errors.first_name = 'Mínimo 2 caracteres';
    } else if (form.first_name.length > 50) {
      errors.first_name = 'Máximo 50 caracteres';
    }

    if (form.second_name.trim() && form.second_name.trim().length < 2) {
      errors.second_name = 'Mínimo 2 caracteres';
    } else if (form.second_name.length > 50) {
      errors.second_name = 'Máximo 50 caracteres';
    }

    if (!form.first_lastname.trim()) {
      errors.first_lastname = 'El primer apellido es requerido';
    } else if (form.first_lastname.trim().length < 2) {
      errors.first_lastname = 'Mínimo 2 caracteres';
    } else if (form.first_lastname.length > 50) {
      errors.first_lastname = 'Máximo 50 caracteres';
    }

    if (!form.second_lastname.trim()) {
      errors.second_lastname = 'El segundo apellido es requerido';
    } else if (form.second_lastname.trim().length < 2) {
      errors.second_lastname = 'Mínimo 2 caracteres';
    } else if (form.second_lastname.length > 50) {
      errors.second_lastname = 'Máximo 50 caracteres';
    }

    if (!form.email.trim()) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      errors.email = 'Formato de correo inválido';
    } else if (form.email.length > 150) {
      errors.email = 'Máximo 150 caracteres';
    }

    // Validar teléfonos
    const phone0 = form.phones?.[0]?.number?.trim() ?? '';
    const phone1 = form.phones?.[1]?.number?.trim() ?? '';

    if (phone0 && !/^[\+]?[\d\s\-\(\)]+$/.test(phone0)) {
      errors.phone_personal = 'Solo números, espacios, guiones, paréntesis y + son permitidos';
    }
    if (phone1 && !/^[\+]?[\d\s\-\(\)]+$/.test(phone1)) {
      errors.phone_business = 'Solo números, espacios, guiones, paréntesis y + son permitidos';
    }

    // Al menos un teléfono es requerido
    if (!phone0 && !phone1) {
      errors.phone_personal = 'Debes proporcionar al menos un número de teléfono';
      errors.phone_business = 'Debes proporcionar al menos un número de teléfono';
    }

    // Si hay errores, mostrarlos y no enviar
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores antes de continuar');
      return;
    }

    // Deshabilitar botón inmediatamente al hacer clic
    setIsButtonDisabled(true);
    setSaving(true);
    setError(null);
    setOk(null);
    setFieldErrors({});

    try {
      const main = onlyDigits(form.phones?.[0]?.number ?? '');
      const biz  = onlyDigits(form.phones?.[1]?.number ?? '');

      const phones: ApiPhone[] = [];
      if (main) phones.push({ number: main, type: 'personal',  is_primary: true  });
      if (biz)  phones.push({ number: biz,  type: 'business', is_primary: false });

      // NO incluir facebook/instagram aquí (se editan en Emprendedor)
      const payload: Omit<UpdatePersonPayload, 'phones'> & { phones?: ApiPhone[] } = {
        first_name: form.first_name || undefined,
        second_name: form.second_name || undefined,
        first_lastname: form.first_lastname || undefined,
        second_lastname: form.second_lastname || undefined,
        email: form.email || undefined,
        phones: phones.length ? phones : undefined,
      };

      await updatePerson(personId, payload as UpdatePersonPayload);

      // Normalizar el formulario con los datos tal como se guardaron
      const normalizedAfterSave = {
        ...form,
        phones: [
          { number: main, type: 'personal',  is_primary: true },
          { number: biz,  type: 'business',  is_primary: false },
        ],
      };

      // Actualizar tanto el formulario como la referencia de guardado
      setForm(normalizedAfterSave);
      lastSavedRef.current = buildComparableSnapshot(normalizedAfterSave);

      setOk('Datos guardados correctamente.');
      await onSaved?.();

      // Mostrar mensaje de éxito por 2 segundos
      setTimeout(() => {
        setOk(null);
      }, 2000);

      // Rehabilitar isButtonDisabled, pero canSubmit seguirá siendo false porque isDirty = false
      setIsButtonDisabled(false);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error al guardar los datos');
      // Si hay error, rehabilitar el botón para permitir reintento
      setIsButtonDisabled(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-section__placeholder">Cargando…</div>;
  if (error)   return <div className="profile-section__placeholder">{error}</div>;

  return (
    <form className="profile-form" onSubmit={onSubmit}>
      <div className="grid">
        <label className="field">
          <span>Nombre <span style={{ color: '#ef4444' }}>*</span></span>
          <input
            name="first_name"
            value={form.first_name}
            onChange={onChange}
            placeholder="Nombre"
            maxLength={50}
            style={fieldErrors.first_name ? { borderColor: '#ef4444' } : {}}
          />
          {fieldErrors.first_name && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              {fieldErrors.first_name}
            </span>
          )}
        </label>
        <label className="field">
          <span>Segundo nombre</span>
          <input
            name="second_name"
            value={form.second_name}
            onChange={onChange}
            placeholder="Segundo nombre (opcional)"
            maxLength={50}
            style={fieldErrors.second_name ? { borderColor: '#ef4444' } : {}}
          />
          {fieldErrors.second_name && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              {fieldErrors.second_name}
            </span>
          )}
        </label>
        <label className="field">
          <span>Primer apellido <span style={{ color: '#ef4444' }}>*</span></span>
          <input
            name="first_lastname"
            value={form.first_lastname}
            onChange={onChange}
            placeholder="Primer apellido"
            maxLength={50}
            style={fieldErrors.first_lastname ? { borderColor: '#ef4444' } : {}}
          />
          {fieldErrors.first_lastname && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              {fieldErrors.first_lastname}
            </span>
          )}
        </label>
        <label className="field">
          <span>Segundo apellido <span style={{ color: '#ef4444' }}>*</span></span>
          <input
            name="second_lastname"
            value={form.second_lastname}
            onChange={onChange}
            placeholder="Segundo apellido"
            maxLength={50}
            style={fieldErrors.second_lastname ? { borderColor: '#ef4444' } : {}}
          />
          {fieldErrors.second_lastname && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              {fieldErrors.second_lastname}
            </span>
          )}
        </label>
        <label className="field" style={{ gridColumn: '1/-1' }}>
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={onChange} placeholder="correo@ejemplo.com" maxLength={150} disabled readOnly />
        </label>
      </div>

      <div className="phones-block" style={{ marginTop: '1rem' }}>
        <h4 className="mb-2">Teléfonos</h4>
        <div className="phones-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div className="field" style={{ display: 'block' }}>
            <span className="block text-sm mb-1">Teléfono principal</span>
            <input
              className="phone-number"
              value={form.phones?.[0]?.number ?? ''}
              onChange={(e) => onPhoneChange(0, e.target.value)}
              placeholder="77777777"
              maxLength={20}
              style={{
                width: '100%',
                ...(fieldErrors.phone_personal ? { borderColor: '#ef4444' } : {})
              }}
            />
            {fieldErrors.phone_personal && (
              <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {fieldErrors.phone_personal}
              </span>
            )}
          </div>
          <div className="field" style={{ display: 'block' }}>
            <span className="block text-sm mb-1">Teléfono de negocio</span>
            <input
              className="phone-number"
              value={form.phones?.[1]?.number ?? ''}
              onChange={(e) => onPhoneChange(1, e.target.value)}
              placeholder="88888888"
              maxLength={20}
              style={{
                width: '100%',
                ...(fieldErrors.phone_business ? { borderColor: '#ef4444' } : {})
              }}
            />
            {fieldErrors.phone_business && (
              <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {fieldErrors.phone_business}
              </span>
            )}
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic', marginTop: '0.5rem' }}>
          * Debes proporcionar al menos un número de teléfono
        </p>
      </div>

      {/* 🔕 Redes sociales NO se muestran en Perfil. Se gestionan en Emprendedor. */}

      <div className="actions mt-8 flex justify-end">
        <button type="submit" className="save-btn" disabled={!canSubmit}>
          {saving ? 'Guardando…' : ok ? 'Guardado ✓' : 'Guardar Cambios'}
        </button>
      </div>

      {ok && <div className="profile-ok" style={{ marginTop: 12 }}>{ok}</div>}
      {error && <div className="profile-error" style={{ marginTop: 12 }}>{error}</div>}
    </form>
  );
};

export default ProfilePersonalForm;
