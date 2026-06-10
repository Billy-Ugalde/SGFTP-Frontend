import './EmptyState.css';

interface EmptyStateProps {
  recurso: string;
  genero?: 'm' | 'f';
  subtitulo?: string;
}

const EmptyState = ({ recurso, genero = 'm', subtitulo }: EmptyStateProps) => {
  const registrados = genero === 'f' ? 'registradas' : 'registrados';
  const nuevos = genero === 'f' ? 'nuevas' : 'nuevos';
  const defaultSubtitulo = `Ingrese ${nuevos} ${recurso} o verifique si tiene filtros de búsqueda activos.`;

  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <svg width={40} height={40} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="empty-state__title">No hay {recurso} {registrados} en el sistema.</p>
      <p className="empty-state__subtitle">{subtitulo ?? defaultSubtitulo}</p>
    </div>
  );
};

export default EmptyState;
