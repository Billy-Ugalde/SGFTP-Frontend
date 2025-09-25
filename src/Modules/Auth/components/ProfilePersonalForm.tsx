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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOk(null);
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onPhoneChange = (index: 0 | 1, value: string) => {
    setOk(null);
    setForm(prev => ({
      ...prev,
      phones: prev.phones.map((p, i) => (i === index ? { ...p, number: value } : p)),
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;

    setSaving(true);
    setError(null);
    setOk(null);

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
      setOk('Datos guardados correctamente.');

      const normalizedAfterSave = {
        ...form,
        phones: [
          { number: main, type: 'personal',  is_primary: true },
          { number: biz,  type: 'business',  is_primary: false },
        ],
      };
      lastSavedRef.current = buildComparableSnapshot(normalizedAfterSave);
      await onSaved?.();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error al guardar los datos');
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
          <span>Nombre</span>
          <input name="first_name" value={form.first_name} onChange={onChange} placeholder="Nombre" />
        </label>
        <label className="field">
          <span>Segundo nombre</span>
          <input name="second_name" value={form.second_name} onChange={onChange} placeholder="Segundo nombre (opcional)" />
        </label>
        <label className="field">
          <span>Primer apellido</span>
          <input name="first_lastname" value={form.first_lastname} onChange={onChange} placeholder="Primer apellido" />
        </label>
        <label className="field">
          <span>Segundo apellido</span>
          <input name="second_lastname" value={form.second_lastname} onChange={onChange} placeholder="Segundo apellido" />
        </label>
        <label className="field" style={{ gridColumn: '1/-1' }}>
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={onChange} placeholder="correo@ejemplo.com" />
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
              style={{ width: '100%' }}
            />
          </div>
          <div className="field" style={{ display: 'block' }}>
            <span className="block text-sm mb-1">Teléfono de negocio</span>
            <input
              className="phone-number"
              value={form.phones?.[1]?.number ?? ''}
              onChange={(e) => onPhoneChange(1, e.target.value)}
              placeholder="88888888"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* 🔕 Redes sociales NO se muestran en Perfil. Se gestionan en Emprendedor. */}

      <div className="actions mt-8 flex justify-end">
        <button type="submit" className="save-btn" disabled={saving || !hydrated || !isDirty}>
          {saving ? 'Guardando…' : 'Guardar Cambios'}
        </button>
      </div>

      {ok && <div className="profile-ok" style={{ marginTop: 12 }}>{ok}</div>}
      {error && <div className="profile-error" style={{ marginTop: 12 }}>{error}</div>}
    </form>
  );
};

export default ProfilePersonalForm;
