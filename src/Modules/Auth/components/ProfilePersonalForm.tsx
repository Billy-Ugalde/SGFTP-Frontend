import React, { useEffect, useMemo, useState } from 'react';
import { getPersonById, updatePerson, type UpdatePersonPayload } from '../services/personService';

type Props = {
  personId: number;
  onSaved?: () => Promise<void> | void; // opcional: para refrescar identidad (checkAuth)
};

type PhoneType = 'PERSONAL' | 'WORK' | 'HOME';
type PhoneRow = { number: string; type?: PhoneType; is_primary?: boolean; };

const emptyPhone: PhoneRow = { number: '', type: 'PERSONAL', is_primary: false };

const ProfilePersonalForm: React.FC<Props> = ({ personId, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: '',
    second_name: '',
    first_lastname: '',
    second_lastname: '',
    email: '',
    phones: [] as PhoneRow[],
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getPersonById(personId);
        if (!mounted) return;
        setForm({
          first_name: data.first_name ?? '',
          second_name: data.second_name ?? '',
          first_lastname: data.first_lastname ?? '',
          second_lastname: data.second_lastname ?? '',
          email: data.email ?? '',
          phones: (data.phones ?? []).map((p: any) => ({
            number: p.number ?? '',
            type: (p.type as PhoneType) ?? 'PERSONAL',
            is_primary: !!p.is_primary,
          })),
        });
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? 'No se pudo cargar la información personal');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [personId]);

  const canAddMorePhones = useMemo(() => form.phones.length < 5, [form.phones.length]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onPhoneChange = (index: number, field: keyof PhoneRow, value: any) => {
    setForm(prev => ({
      ...prev,
      phones: prev.phones.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  };

  const addPhone = () => setForm(prev => ({ ...prev, phones: [...prev.phones, { ...emptyPhone }] }));
  const removePhone = (index: number) => setForm(prev => ({ ...prev, phones: prev.phones.filter((_, i) => i !== index) }));
  const markPrimary = (index: number) => {
    setForm(prev => ({ ...prev, phones: prev.phones.map((p, i) => ({ ...p, is_primary: i === index })) }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const payload: UpdatePersonPayload = {
        first_name: form.first_name || undefined,
        second_name: form.second_name || undefined,
        first_lastname: form.first_lastname || undefined,
        second_lastname: form.second_lastname || undefined,
        email: form.email || undefined,
        phones: form.phones.length
          ? form.phones.map(p => ({
              number: p.number || undefined,
              type: p.type || undefined,
              is_primary: p.is_primary ?? undefined,
            }))
          : undefined,
      };
      await updatePerson(personId, payload);
      setOk('Datos guardados correctamente.');
      await onSaved?.(); // refrescar identidad si hace falta (ej. checkAuth)
    } catch (e: any) {
      setError(e?.message ?? 'Error al guardar los datos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-section__placeholder">Cargando…</div>;
  if (error) return <div className="profile-section__placeholder">{error}</div>;

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

      <div className="phones-block">
        <div className="phones-header">
          <h4>Teléfonos</h4>
          {canAddMorePhones && (
            <button type="button" className="btn btn--primary" onClick={addPhone}>Agregar teléfono</button>
          )}
        </div>

        {form.phones.length === 0 && <div className="profile-section__hint">Sin teléfonos. Agrega al menos uno.</div>}

        <div className="phones-grid">
          {form.phones.map((p, idx) => (
            <div key={idx} className="phone-row">
              <input
                className="phone-number"
                value={p.number}
                onChange={(e) => onPhoneChange(idx, 'number', e.target.value)}
                placeholder="+506 8888 8888"
              />
              <select
                className="phone-type"
                value={p.type ?? 'PERSONAL'}
                onChange={(e) => onPhoneChange(idx, 'type', e.target.value as PhoneType)}
              >
                <option value="PERSONAL">Personal</option>
                <option value="WORK">Trabajo</option>
                <option value="HOME">Casa</option>
              </select>

              <label className="phone-primary">
                <input
                  type="radio"
                  name="is_primary"
                  checked={!!p.is_primary}
                  onChange={() => markPrimary(idx)}
                /> Principal
              </label>

              <button type="button" className="btn btn--exit phone-remove" onClick={() => removePhone(idx)}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar Cambios'}
        </button>
      </div>

      {ok && <div className="profile-ok">{ok}</div>}
      {error && <div className="profile-error">{error}</div>}
    </form>
  );
};

export default ProfilePersonalForm;
