import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/profile-page.css';

type TabKey =
  | 'perfil'
  | 'contrasena'
  | 'notificaciones';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'perfil', label: 'Perfil' },
  { key: 'contrasena', label: 'Contraseña' },
  { key: 'notificaciones', label: 'Notificaciones' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState<TabKey>('perfil');

  const [form, setForm] = useState({
    email: user?.email ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.firstLastname ?? '',
    company: '',
    title: '',
    timezone: 'UTC',
    discord: '',
  });

  const title = useMemo(() => {
    const t = TABS.find((t) => t.key === active)?.label ?? '';
    return `Editar ${t.toLowerCase()}`;
  }, [active]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrar con tu API (authService.updateProfile(form))
    console.log('Guardar cambios', active, form);
    alert('Cambios guardados (demo). Integra el servicio cuando esté listo.');
  };

  return (
    <div className="profile-page">
      <div className="profile-shell">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {(user?.firstName?.[0] ?? 'U').toUpperCase()}
            </div>
            <button
              className="avatar-upload-btn"
              type="button"
              title="Añadir nueva imagen"
            >
              Añadir una nueva imagen
            </button>
          </div>

          <nav className="profile-nav">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`profile-nav-item ${
                  active === tab.key ? 'active' : ''
                }`}
                onClick={() => setActive(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* ⬇️ Botón dentro de la tarjeta del sidebar, al fondo */}
          <button
            className="profile-exit-btn"
            onClick={() => navigate('/')}
            title="Volver a la vista pública"
            aria-label="Volver a la vista pública"
          >
            Salir
          </button>
        </aside>

        {/* Contenido */}
        <main className="profile-content">
          <h1 className="profile-title">{title}</h1>

          {active === 'perfil' && (
            <form className="profile-form" onSubmit={onSubmit}>
              <div className="grid">
                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                  />
                </label>

                <label className="field">
                  <span>Nombre</span>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={onChange}
                  />
                </label>

                <label className="field">
                  <span>Apellido</span>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={onChange}
                  />
                </label>

                <label className="field">
                  <span>Empresa</span>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={onChange}
                  />
                </label>

                <label className="field">
                  <span>Título profesional</span>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={onChange}
                  />
                </label>

                <label className="field">
                  <span>Zona horaria</span>
                  <select
                    name="timezone"
                    value={form.timezone}
                    onChange={onChange}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/Costa_Rica">
                      America/Costa_Rica
                    </option>
                    <option value="America/Mexico_City">
                      America/Mexico_City
                    </option>
                  </select>
                </label>

                <label className="field">
                  <span>Usuario de Discord</span>
                  <input
                    type="text"
                    name="discord"
                    value={form.discord}
                    onChange={onChange}
                  />
                </label>
              </div>

              <div className="actions">
                <button type="submit" className="save-btn">
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}

          {active !== 'perfil' && (
            <div className="placeholder">
              <p>
                Sección “{TABS.find((t) => t.key === active)?.label}”.
                Implementación pendiente.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
