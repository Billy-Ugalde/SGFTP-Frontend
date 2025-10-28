import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Auth/context/AuthContext';

// ⬇️ Servicios de Emprendedores
import {
  useEntrepreneurById,
  useEntrepreneurByEmail, // ← NUEVO: fallback por email si no hay id en sesión
} from '../../Entrepreneurs/Services/EntrepreneursServices';

// ⬇️ Servicios de Voluntarios
import {
  useMyVolunteerProfile,
} from '../../Volunteers/Services/VolunteersServices';

// Formulario de datos personales
import ProfilePersonalForm from '../components/ProfilePersonalForm';
import { ChangePasswordForm } from '../components/ChangePasswordForm';

// ⬇️ NUEVO: sólo la parte de Emprendimiento (edit)
import EntrepreneurshipOnlyForm from '../components/EntrepreneurshipOnlyForm';

// ⬇️ NUEVO: formulario de edición de perfil de voluntario
import EditVolunteerProfileForm from '../../Volunteers/Components/EditVolunteerProfileForm';

// ⬇️ NUEVO: componentes de actividades de voluntario
import MyUpcomingActivities from '../../Volunteers/Components/MyUpcomingActivities';
import MyPastActivities from '../../Volunteers/Components/MyPastActivities';
import MyMailbox from '../../Volunteers/Components/MyMailbox';

import '../styles/profile-page.css';

type SectionKey =
  | 'perfil'
  | 'emprendedor'
  | 'voluntario'
  | 'donador'
  | 'notificaciones'
  | 'contrasena';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, checkAuth } = useAuth();

  const initialTab = (params.get('tab') as SectionKey) || 'perfil';
  const [active, setActive] = useState<SectionKey>(initialTab);

  const [justEnrolled, setJustEnrolled] = useState<
    Partial<Record<'entrepreneur' | 'volunteer' | 'donor', boolean>>
  >({});

  const name = useMemo(() => {
    const first = (user as any)?.firstName || (user as any)?.first_name || '';
    const last =
      (user as any)?.firstLastname || (user as any)?.first_lastname || '';
    return `${first} ${last}`.trim() || ((user as any)?.displayName ?? '');
  }, [user]);

  const roles: string[] = ((user as any)?.roles ?? []).map((r: any) =>
    String(r).toLowerCase(),
  );
  const hasRole = (r: 'entrepreneur' | 'volunteer' | 'donor') =>
    roles.includes(r);

  const entrepreneurId: number | undefined =
    (user as any)?.id_entrepreneur ??
    (user as any)?.entrepreneurId ??
    (user as any)?.entrepreneur?.id_entrepreneur;

  // 1) intentamos por id
  const { data: myEntrepreneur } = useEntrepreneurById(entrepreneurId);

  // 2) fallback por email si no hubo id
  const emailFromUser =
    (user as any)?.email ??
    (user as any)?.user?.email ??
    (user as any)?.person?.email ??
    '';
  const { data: myEntrepreneurByEmail } = useEntrepreneurByEmail(
    !myEntrepreneur && !entrepreneurId ? emailFromUser : undefined,
  );

  const entrepreneurResolved = myEntrepreneur || myEntrepreneurByEmail || undefined;

  // Cargar perfil de voluntario si tiene el rol
  // IMPORTANTE: Los hooks deben llamarse incondicionalmente, pero React Query maneja el enabled
  const { data: myVolunteer, isLoading: loadingVolunteer, error: errorVolunteer } = useMyVolunteerProfile();

  // DEBUG: Log del estado del hook
  console.log('🔍 useMyVolunteerProfile state:', {
    hasVolunteerRole: hasRole('volunteer'),
    myVolunteer,
    loadingVolunteer,
    errorVolunteer,
    errorMessage: errorVolunteer ? (errorVolunteer as any)?.message : null,
    errorResponse: errorVolunteer ? (errorVolunteer as any)?.response : null
  });

  // Si hay error, también mostrarlo en consola de forma más visible
  if (errorVolunteer) {
    console.error('❌ ERROR al cargar perfil de voluntario:', errorVolunteer);
    console.error('   Response:', (errorVolunteer as any)?.response);
    console.error('   Status:', (errorVolunteer as any)?.response?.status);
    console.error('   Data:', (errorVolunteer as any)?.response?.data);
  }

  const handleEnroll = async (role: 'entrepreneur' | 'volunteer' | 'donor') => {
    setJustEnrolled((prev) => ({ ...prev, [role]: true }));
  };

  // ===== Secciones =====
  const renderPerfil = () => {
    // ⬇️ RESOLVEMOS personId también desde el emprendedor o voluntario si la sesión no lo trae
    const personId: number | undefined =
      (user as any)?.id_person ??
      (user as any)?.person?.id_person ??
      (user as any)?.personId ??
      entrepreneurResolved?.person?.id_person ?? // fallback desde emprendedor
      myVolunteer?.person?.id_person; // ← NUEVO: fallback desde voluntario

    // DEBUG: Logs para identificar el problema
    console.log('🔍 DEBUG - renderPerfil:');
    console.log('  user:', user);
    console.log('  entrepreneurResolved:', entrepreneurResolved);
    console.log('  myVolunteer:', myVolunteer);
    console.log('  loadingVolunteer:', loadingVolunteer);
    console.log('  personId FINAL:', personId);

    // Si es voluntario y aún estamos cargando, mostrar loading
    if (hasRole('volunteer') && loadingVolunteer && !personId) {
      return (
        <div className="profile-section">
          <div className="profile-section__header">
            <h2>Perfil</h2>
            <p className="profile-section__hint">
              Información personal asociada a tu cuenta.
            </p>
          </div>
          <div className="profile-section__placeholder">
            Cargando información del perfil...
          </div>
        </div>
      );
    }

    return (
      <div className="profile-section">
        <div className="profile-section__header">
          <h2>Perfil</h2>
          <p className="profile-section__hint">
            Información personal asociada a tu cuenta.
          </p>
        </div>
        {personId ? (
          <ProfilePersonalForm personId={personId} onSaved={checkAuth} />
        ) : (
          <div className="profile-section__placeholder">
            <p>No se encontró el identificador de persona en tu sesión.</p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
              Debug: user={JSON.stringify(user)}, myVolunteer={myVolunteer ? JSON.stringify(myVolunteer) : 'null'}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderEntrepreneur = () => {
    const canSeeForms = hasRole('entrepreneur') || justEnrolled.entrepreneur;

    return (
      <div className="profile-section">
        <div className="profile-section__header">
          <h2>Emprendedor</h2>
          <p className="profile-section__hint">
            Edita la información de tu emprendimiento.
          </p>
        </div>

        {!canSeeForms ? (
          <div className="role-cta">
            <div className="role-cta__card">
              <h3>¿Quieres ser emprendedor?</h3>
              <p>Inscríbete para habilitar tu formulario.</p>
              <button
                className="btn btn--primary"
                onClick={() => handleEnroll('entrepreneur')}
              >
                Ser emprendedor
              </button>
            </div>
          </div>
        ) : entrepreneurResolved?.id_entrepreneur ? (
          // 👉 Sólo edición del emprendimiento (endpoint público, sin 403)
          <EntrepreneurshipOnlyForm
            entrepreneur={entrepreneurResolved}
            onSuccess={() => {
              checkAuth?.();
            }}
          />
        ) : (
          // No mostramos "crear". Sólo informamos que no hay emprendimiento registrado.
          <div className="profile-section__placeholder">
            <p>
              No se encontró información de emprendimiento asociada a tu cuenta.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderVoluntario = () => {
    const canSeeForms = hasRole('volunteer') || justEnrolled.volunteer;
    return (
      <div className="profile-section">
        <div className="profile-section__header">
          <h2>Voluntario</h2>
          <p className="profile-section__hint">
            Gestiona tus actividades y mensajes como voluntario.
          </p>
        </div>

        {!canSeeForms ? (
          <div className="role-cta">
            <div className="role-cta__card">
              <h3>¿Quieres ser voluntario?</h3>
              <p>Inscríbete para habilitar tu perfil de voluntario.</p>
              <button
                className="btn btn--primary"
                onClick={() => handleEnroll('volunteer')}
              >
                Ser voluntario
              </button>
            </div>
          </div>
        ) : myVolunteer ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Próximas Actividades */}
            <MyUpcomingActivities />

            {/* Historial de Actividades */}
            <MyPastActivities />

            {/* Mailbox */}
            <MyMailbox />
          </div>
        ) : (
          <div className="profile-section__placeholder">
            <p>
              No se encontró información de voluntario asociada a tu cuenta.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderDonador = () => {
    const canSeeForms = hasRole('donor') || justEnrolled.donor;
    return (
      <div className="profile-section">
        <div className="profile-section__header">
          <h2>Donador</h2>
          {!canSeeForms ? (
            <div className="role-cta__card">
              <h3>¿Quieres ser donador?</h3>
              <p>Inscríbete para habilitar tu formulario (próximamente).</p>
              <button
                className="btn btn--primary"
                onClick={() => handleEnroll('donor')}
              >
                Ser donador
              </button>
            </div>
          ) : (
            <p className="profile-section__hint">
              Formulario de donador (próximamente).
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderNotificaciones = () => (
    <div className="profile-section">
      <div className="profile-section__header">
        <h2>Notificaciones</h2>
        <p className="profile-section__hint">Se implementará en una siguiente etapa.</p>
      </div>
    </div>
  );

  const renderContrasena = () => {
    const handlePasswordChangeSuccess = () => {
      // Forzar logout por seguridad después del cambio
      navigate('/login');
    };

    return (
      <div className="profile-section">
        <ChangePasswordForm onSuccess={handlePasswordChangeSuccess} />
      </div>
    );
  };

  const contentBySection: Record<SectionKey, React.ReactNode> = {
    perfil: renderPerfil(),
    emprendedor: renderEntrepreneur(),
    voluntario: renderVoluntario(),
    donador: renderDonador(),
    notificaciones: renderNotificaciones(),
    contrasena: renderContrasena(),
  };

  return (
    <div className="profile-page">
      <div className="profile-page__container">
        {/* Sidebar */}
        <aside className="profile-page__sidebar">
          <div className="profile-page__avatar">
            <div className="avatar-circle">
              {(name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>

          <nav className="profile-page__menu">
            <button
              className={`profile-page__menu-item ${
                active === 'perfil' ? 'is-active' : ''
              }`}
              onClick={() => setActive('perfil')}
            >
              Perfil
            </button>

            <button
              className={`profile-page__menu-item ${
                active === 'emprendedor' ? 'is-active' : ''
              }`}
              onClick={() => setActive('emprendedor')}
            >
              Emprendedor{' '}
              {!hasRole('entrepreneur') && !justEnrolled.entrepreneur && (
                <span className="menu-item__badge">No inscrito</span>
              )}
            </button>

            <button
              className={`profile-page__menu-item ${
                active === 'voluntario' ? 'is-active' : ''
              }`}
              onClick={() => setActive('voluntario')}
            >
              Voluntario{' '}
              {!hasRole('volunteer') && !justEnrolled.volunteer && (
                <span className="menu-item__badge">No inscrito</span>
              )}
            </button>

            <button
              className={`profile-page__menu-item ${
                active === 'donador' ? 'is-active' : ''
              }`}
              onClick={() => setActive('donador')}
            >
              Donador{' '}
              {!hasRole('donor') && !justEnrolled.donor && (
                <span className="menu-item__badge">No inscrito</span>
              )}
            </button>

            <button
              className={`profile-page__menu-item ${
                active === 'contrasena' ? 'is-active' : ''
              }`}
              onClick={() => setActive('contrasena')}
            >
              Contraseña
            </button>
          </nav>

          <div className="profile-page__exit">
            <button className="btn btn--exit" onClick={() => navigate('/')}>
              Salir
            </button>
          </div>
        </aside>

        {/* Contenido */}
        <main className="profile-page__content">{contentBySection[active]}</main>
      </div>
    </div>
  );
};

export default ProfilePage;
