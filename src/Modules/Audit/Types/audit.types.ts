// ── Tipos del API ─────────────────────────────────────────────────────────────

export interface AuditLog {
  id: number;
  timestamp: string;
  user_id: number | null;
  user_email: string | null;
  user_roles: string[] | null;
  action: string;
  entity: string;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  source: string;
  context?: { label: string; value: string }[];
  user: {
    id_user: number;
    person: {
      first_name: string;
      first_lastname: string;
      email: string;
    };
  } | null;
}

export interface AuditStats {
  total_events: number;
  role_changes: number;
  events_today: number;
}

export interface AuditPaginatedResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditFilters {
  entity: string;
  action: string;
  user_role: string;
  search: string;
  date_from: string;
  date_to: string;
  page: number;
  limit: number;
}

// ── Helpers de visualización ──────────────────────────────────────────────────

export const ACTION_LABEL: Record<string, string> = {
  INSERT:          'Creación',
  UPDATE:          'Edición',
  STATUS_CHANGE:   'Cambio de estado',
  ROLE_ASSIGNED:   'Asignación de rol',
  ROLE_REMOVED:    'Remoción de rol',
  DELETE:          'Eliminación',
  EXPORT:          'Exportación',
};

export const ENTITY_LABEL: Record<string, string> = {
  users:                'Usuarios',
  entrepreneurs:        'Emprendedores',
  entrepreneurships:    'Emprendedores',
  fair:                 'Ferias',
  fair_enrollment:      'Ferias',
  project:              'Proyectos',
  activity:             'Actividades',
  activity_enrollment:  'Actividades',
  volunteers:           'Voluntarios',
  news:                 'Noticias',
  content_blocks:       'Contenido',
  subscriber:           'Suscriptores',
  donation:             'Donaciones',
  newsletter_campaigns: 'Newsletters',
};

interface EntityNoun {
  article: string; 
  noun: string;
}

const ENTITY_NOUN: Record<string, EntityNoun> = {
  users:                { article: 'un',  noun: 'usuario' },
  entrepreneurs:        { article: 'un',  noun: 'emprendedor' },
  entrepreneurships:    { article: 'un',  noun: 'emprendimiento' },
  fair:                 { article: 'una', noun: 'feria' },
  fair_enrollment:      { article: 'una', noun: 'inscripción a feria' },
  project:              { article: 'un',  noun: 'proyecto' },
  activity:             { article: 'una', noun: 'actividad' },
  activity_enrollment:  { article: 'una', noun: 'inscripción a actividad' },
  volunteers:           { article: 'un',  noun: 'voluntario' },
  news:                 { article: 'una', noun: 'noticia' },
  content_blocks:       { article: 'un',  noun: 'bloque de contenido' },
  subscriber:           { article: 'un',  noun: 'suscriptor' },
  donation:             { article: 'una', noun: 'donación' },
  newsletter_campaigns: { article: 'una', noun: 'campaña de newsletter' },
};

const ACTION_DESCRIPTION: Record<string, string> = {
  'fair_enrollment:INSERT':            'Inscripción de un emprendedor a una feria',
  'fair_enrollment:STATUS_CHANGE':     'Cambio de estado de una inscripción a feria',
  'activity_enrollment:INSERT':        'Inscripción de un voluntario a una actividad',
  'activity_enrollment:STATUS_CHANGE': 'Cambio de estado de una inscripción a actividad',
  'entrepreneurs:INSERT':              'Registro de un nuevo emprendedor',
  'users:INSERT':                      'Creación de un nuevo usuario',
  'subscriber:INSERT':                 'Nueva suscripción al boletín',
  'subscriber:DELETE':                 'Baja de una suscripción al boletín',
  'donation:INSERT':                   'Registro de una nueva donación',
  'newsletter_campaigns:INSERT':       'Envío de una campaña de newsletter',
};

const ACTION_TEMPLATE: Record<string, (e: EntityNoun) => string> = {
  INSERT:          e => `Creación de ${e.article} ${e.noun}`,
  UPDATE:          e => `Edición de ${e.article} ${e.noun}`,
  DELETE:          e => `Eliminación de ${e.article} ${e.noun}`,
  STATUS_CHANGE:   e => `Cambio de estado de ${e.article} ${e.noun}`,
  EXPORT:          e => `Exportación de ${e.noun}`,
  ROLE_ASSIGNED:   () => 'Asignación de un rol a un usuario',
  ROLE_REMOVED:    () => 'Remoción de un rol de un usuario',
  PASSWORD_CHANGE: () => 'Cambio de contraseña de un usuario',
  PASSWORD_RESET:  () => 'Solicitud de restablecimiento de contraseña',
};

export const getActionDescription = (entity: string, action: string): string => {
  const special = ACTION_DESCRIPTION[`${entity}:${action}`];
  if (special) return special;

  const noun = ENTITY_NOUN[entity];
  const tpl = ACTION_TEMPLATE[action];
  if (tpl) return tpl(noun ?? { article: 'un', noun: 'registro' });

  return `${ACTION_LABEL[action] ?? action} · ${ENTITY_LABEL[entity] ?? entity}`;
};

export const getUserDisplay = (log: AuditLog): string => {
  if (log.user?.person) {
    return `${log.user.person.first_name} ${log.user.person.first_lastname}`;
  }
  return log.user_email ?? 'Sistema';
};

export const getUserInitials = (log: AuditLog): string => {
  if (log.user?.person) {
    return `${log.user.person.first_name[0]}${log.user.person.first_lastname[0]}`.toUpperCase();
  }
  if (log.user_email) return log.user_email[0].toUpperCase();
  return 'S';
};

export const formatDatetime = (timestamp: string): string => {
  const d = new Date(timestamp);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
};

// ── Traducción de claves y valores JSON → español legible ─────────────────────

const KEY_LABEL: Record<string, string> = {
  status:                 'Estado',
  Status:                 'Estado',
  Status_activity:        'Estado',
  is_active:              'Activo',
  Active:                 'Activo',
  isEmailVerified:        'Email verificado',
  archived:               'Archivada',
  OpenForRegistration:    'Inscripciones abiertas',
  role_id:                'Rol',
  user_id:                'Usuario ID',
  id_fair:                'Feria ID',
  id_entrepreneur:        'Emprendedor ID',
  id_entreprenuer:        'Emprendedor ID',
  id_volunteer:           'Voluntario ID',
  id_activity:            'Actividad ID',
  id_stand:               'Stand',
  id_user:                'Usuario ID',
  name:                   'Nombre',
  Name:                   'Nombre',
  title:                  'Título',
  description:            'Descripción',
  Description:            'Descripción',
  author:                 'Autor',
  email:                  'Correo',
  experience:             'Experiencia (años)',
  facebook_url:           'Facebook',
  instagram_url:          'Instagram',
  category:               'Categoría',
  location:               'Ubicación',
  Location:               'Ubicación',
  date:                   'Fecha',
  stand_capacity:         'Capacidad de stands',
  typeFair:               'Tipo de feria',
  Spaces:                 'Cupos',
  Aim:                    'Objetivo',
  Target_population:      'Población objetivo',
  text_content:           'Contenido',
  image_url:              'Imagen',
  page:                   'Página',
  section:                'Sección',
  block_key:              'Clave',
  donationType:           'Tipo de donación',
  donationDetails:        'Detalles',
  idDonor:                'Donante ID',
  language:               'Idioma',
  subject:                'Asunto',
  totalRecipients:        'Total destinatarios',
  successfulSends:        'Envíos exitosos',
  failedSends:            'Envíos fallidos',
  attendance_date:        'Fecha de asistencia',
};

const VALUE_LABEL: Record<string, string> = {
  enrolled:     'Inscrito',
  attended:     'Asistió',
  not_attended: 'No asistió',
  cancelled:    'Cancelado',
  pending:      'Pendiente',
  approved:     'Aprobado',
  rejected:     'Rechazado',
  published:    'Publicado',
  draft:        'Borrador',
  archived:     'Archivado',
  planning:     'En planificación',
  execution:    'En ejecución',
  suspended:    'Suspendido',
  finished:     'Finalizado',
  nuevo:        'Nuevo',
  ejecucion:    'En ejecución',
  finalizado:   'Finalizado',
  suspendido:   'Suspendido',
  interna:      'Interna',
  externa:      'Externa',
  spanish:      'Español',
  english:      'Inglés',
  food:         'Alimentos',
  clothing:     'Ropa',
  money:        'Dinero',
  used_items:   'Artículos usados',
  other:        'Otro',
  completed:    'Completado',
  failed:       'Fallido',
  partial:      'Parcial',
};

const BOOLEAN_KEYS = new Set([
  'is_active', 'Active', 'active', 'archived', 'isEmailVerified',
  'OpenForRegistration', 'IsRecurring', 'IsFavorite',
]);

const translateValue = (key: string, val: unknown): string => {
  if (val === null || val === undefined) return '—';
  if (BOOLEAN_KEYS.has(key)) {
    if (val === true  || val === 1  || val === '1')  return 'Sí';
    if (val === false || val === 0  || val === '0')  return 'No';
  }
  return VALUE_LABEL[String(val)] ?? String(val);
};

export const formatAuditData = (
  data: Record<string, unknown> | null,
): { label: string; value: string }[] => {
  if (!data) return [];
  return Object.entries(data).map(([key, val]) => ({
    label: KEY_LABEL[key] ?? key,
    value: translateValue(key, val),
  }));
};
