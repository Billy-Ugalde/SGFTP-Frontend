import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { User, Store, HandHelping, Lock, CalendarDays } from 'lucide-react';
import { useAuth } from '../../Auth/context/AuthContext';
import { extractIdsFromMe } from '../services/profileService';

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
import EntrepreneurFairsSection from '../components/EntrepreneurFairsSection';

// ⬇️ Componentes de voluntario
import MyUpcomingActivities from '../../Volunteers/Components/MyUpcomingActivities';
import MyPastActivities from '../../Volunteers/Components/MyPastActivities';
import MyMailbox from '../../Volunteers/Components/MyMailbox';

import { SuccessAlertProvider } from '../../Shared/components';
import '../styles/profile-page.css';

type SectionKey =
  | 'perfil'
  | 'emprendedor'
  | 'inscripciones'
  | 'voluntario'
  | 'notificaciones'
  | 'contrasena';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  general_admin: 'Admin General',
  fair_admin: 'Admin Ferias',
  content_admin: 'Admin Contenido',
  auditor: 'Auditor',
  entrepreneur: 'Emprendedor',
  volunteer: 'Voluntario',
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();
  const { user, checkAuth } = useAuth();

  const isInAdmin = location.pathname.startsWith('/admin');

  React.useEffect(() => {
    if (!isInAdmin) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isInAdmin]);

  const initialTab = (params.get('tab') as SectionKey) || 'perfil';
  const [active, setActive] = useState<SectionKey>(initialTab);

  const [justEnrolled, setJustEnrolled] = useState<
    Partial<Record<'entrepreneur' | 'volunteer', boolean>>
  >({});

  // Estado para las sub-vistas de voluntario (movido fuera de renderVoluntario)
  const [volunteerTab, setVolunteerTab] = useState<'upcoming' | 'history' | 'mailbox'>('upcoming');

  // Resetear el tab de voluntario cuando se cambia de sección
  React.useEffect(() => {
    if (active !== 'voluntario') {
      setVolunteerTab('upcoming');
    }
  }, [active]);

  const firstNameRaw =
    (user as any)?.person?.firstName ||
    (user as any)?.person?.first_name ||
    (user as any)?.firstName ||
    (user as any)?.first_name ||
    '';
  const lastNameRaw =
    (user as any)?.person?.firstLastname ||
    (user as any)?.person?.first_lastname ||
    (user as any)?.firstLastname ||
    (user as any)?.first_lastname ||
    '';

  const name = useMemo(() => {
    const fullName = `${firstNameRaw} ${lastNameRaw}`.trim();
    return fullName || ((user as any)?.displayName ?? 'Usuario');
  }, [firstNameRaw, lastNameRaw, user]);

  const avatarInitials = useMemo(() => {
    const ini = `${(firstNameRaw?.[0] ?? '').toUpperCase()}${(lastNameRaw?.[0] ?? '').toUpperCase()}`;
    return ini || (name?.[0]?.toUpperCase() ?? 'U');
  }, [firstNameRaw, lastNameRaw, name]);

  const email =
    (user as any)?.person?.email || (user as any)?.email || '';

  const roles: string[] = ((user as any)?.roles ?? []).map((r: any) =>
    String(r).toLowerCase(),
  );
  const hasRole = (r: 'entrepreneur' | 'volunteer') =>
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

  // Cargar perfil de voluntario si tiene el rol o acaba de inscribirse
  // IMPORTANTE: Los hooks deben llamarse incondicionalmente, pero React Query maneja el enabled
  const shouldLoadVolunteer = hasRole('volunteer') || justEnrolled.volunteer;
  const { data: myVolunteer, isLoading: loadingVolunteer, error: errorVolunteer } = useMyVolunteerProfile(shouldLoadVolunteer);

  const handleEnroll = async (role: 'entrepreneur' | 'volunteer') => {
    setJustEnrolled((prev) => ({ ...prev, [role]: true }));
  };

  // ===== Secciones =====
  const renderPerfil = () => {
    // ⬇️ RESOLVEMOS personId también desde el emprendedor o voluntario si la sesión no lo trae
    const { personId: personIdFromSession } = extractIdsFromMe(user);
    const personId: number | undefined =
      personIdFromSession ??
      entrepreneurResolved?.person?.id_person ?? // fallback desde emprendedor
      myVolunteer?.person?.id_person;

    // Si es voluntario y aún estamos cargando, mostrar loading
    if (hasRole('volunteer') && loadingVolunteer && !personId) {
      return (
        <div className="profile-section">
          <div className="profile-section__placeholder">
            Cargando información del perfil...
          </div>
        </div>
      );
    }

    return (
      <div className="profile-section">
        {personId ? (
          <ProfilePersonalForm personId={personId} onSaved={checkAuth} />
        ) : (
          <div className="profile-section__placeholder">
            <p>No se encontró el identificador de persona en tu sesión.</p>
          </div>
        )}
      </div>
    );
  };

  const renderEntrepreneur = () => {
    const canSeeForms = hasRole('entrepreneur') || justEnrolled.entrepreneur;

    return (
      <div className="profile-section">
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

  const renderInscripciones = () => (
    <div className="profile-section">
      {entrepreneurResolved?.id_entrepreneur ? (
        <EntrepreneurFairsSection entrepreneurId={entrepreneurResolved.id_entrepreneur} />
      ) : (
        <div className="profile-section__placeholder">
          No se encontró información de emprendimiento para mostrar tus inscripciones.
        </div>
      )}
    </div>
  );

  const renderVoluntario = () => {
    const canSeeForms = hasRole('volunteer') || justEnrolled.volunteer;

    return (
      <div className="profile-section">
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
        ) : loadingVolunteer ? (
          <div className="profile-section__placeholder">
            Cargando información del perfil de voluntario...
          </div>
        ) : myVolunteer ? (
          <div>
            {/* Submenú con Tabs */}
            <div className="volunteer-subtabs">
              <button
                onClick={() => setVolunteerTab('upcoming')}
                className={`volunteer-subtab ${volunteerTab === 'upcoming' ? 'volunteer-subtab--active' : ''}`}
              >
                Próximas Actividades
              </button>
              <button
                onClick={() => setVolunteerTab('history')}
                className={`volunteer-subtab ${volunteerTab === 'history' ? 'volunteer-subtab--active' : ''}`}
              >
                Historial
              </button>
              <button
                onClick={() => setVolunteerTab('mailbox')}
                className={`volunteer-subtab ${volunteerTab === 'mailbox' ? 'volunteer-subtab--active' : ''}`}
              >
                Propuestas
              </button>
            </div>

            {/* Contenido según el tab seleccionado */}
            {volunteerTab === 'upcoming' && <MyUpcomingActivities />}
            {volunteerTab === 'history' && <MyPastActivities />}
            {volunteerTab === 'mailbox' && <MyMailbox />}
          </div>
        ) : (
          <div className="profile-section__placeholder">
            <p>
              No se encontró información de voluntario asociada a tu cuenta.
            </p>
            {errorVolunteer && (
              <p style={{ fontSize: '0.875rem', color: '#ef4444', marginTop: '0.5rem' }}>
                Error: {(errorVolunteer as any)?.message || 'Error desconocido'}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderNotificaciones = () => (
    <div className="profile-section">
      <div className="profile-section__placeholder">
        Las notificaciones se implementarán en una siguiente etapa.
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
    inscripciones: renderInscripciones(),
    voluntario: renderVoluntario(),
    notificaciones: renderNotificaciones(),
    contrasena: renderContrasena(),
  };

  return (
    <SuccessAlertProvider>
    <div className={`profile-page${!isInAdmin ? ' profile-page--public' : ''}`}>
      <div className="profile-page__container">

        <header className="profile-head">
          <div className="profile-head__eyebrow">Mi cuenta</div>
          <h1 className="profile-head__title">Gestión de <em>perfil</em></h1>
          <p className="profile-head__lead">
            Administra tu información y la configuración de tu cuenta.
          </p>
        </header>

        <section className="profile-top">
          <div className="profile-top__avatar">{avatarInitials}</div>
          <div className="profile-top__meta">
            <div className="profile-top__name">{name}</div>
            {email && <div className="profile-top__email">{email}</div>}
            <div className="profile-top__badges">
              {roles.map((r) => (
                <span key={r} className={`pbadge pbadge--${r}`}>
                  {ROLE_LABELS[r] ?? r}
                </span>
              ))}
            </div>
          </div>
          <div className="profile-top__aside">
            <button className="btn--exit" onClick={() => navigate(isInAdmin ? '/admin' : '/')}>
              {isInAdmin ? 'Volver al panel' : 'Volver al inicio'}
            </button>
          </div>
        </section>

        <div className="profile-tabs-scroll">
        <nav className="profile-tabs">
          <button
            className={`profile-tab ${active === 'perfil' ? 'is-active' : ''}`}
            onClick={() => setActive('perfil')}
          >
            <User size={14} /> Datos personales
          </button>

          {(hasRole('entrepreneur') || active === 'emprendedor' || justEnrolled.entrepreneur) && (
            <button
              className={`profile-tab ${active === 'emprendedor' ? 'is-active' : ''}`}
              onClick={() => setActive('emprendedor')}
            >
              <Store size={14} /> Emprendimiento
            </button>
          )}

          {(hasRole('entrepreneur') || active === 'inscripciones' || justEnrolled.entrepreneur) && (
            <button
              className={`profile-tab ${active === 'inscripciones' ? 'is-active' : ''}`}
              onClick={() => setActive('inscripciones')}
            >
              <CalendarDays size={14} /> Inscripciones a ferias
            </button>
          )}

          {(hasRole('volunteer') || active === 'voluntario' || justEnrolled.volunteer) && (
            <button
              className={`profile-tab ${active === 'voluntario' ? 'is-active' : ''}`}
              onClick={() => setActive('voluntario')}
            >
              <HandHelping size={14} /> Voluntariado
            </button>
          )}

          <button
            className={`profile-tab ${active === 'contrasena' ? 'is-active' : ''}`}
            onClick={() => setActive('contrasena')}
          >
            <Lock size={14} /> Contraseña
          </button>
        </nav>
        </div>

        <main className="profile-page__content">{contentBySection[active]}</main>
      </div>
    </div>
    </SuccessAlertProvider>
  );
};

export default ProfilePage;
