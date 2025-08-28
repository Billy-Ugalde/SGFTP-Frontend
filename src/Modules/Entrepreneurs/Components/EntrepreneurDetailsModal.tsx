import GenericModal from './GenericModal';
import type { Entrepreneur, Entrepreneurship } from '../Services/EntrepreneursServices';
import '../Styles/EntrepreneurDetailsModal.css';

interface EntrepreneurDetailsModalProps {
  entrepreneur: Entrepreneur | null;
  show: boolean;
  onClose: () => void;
}

const EntrepreneurDetailsModal = ({ entrepreneur, show, onClose }: EntrepreneurDetailsModalProps) => {
  if (!entrepreneur) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Comida':
        return '🍽️';
      case 'Artesanía':
        return '🎨';
      case 'Vestimenta':
        return '👕';
      case 'Accesorios':
        return '👜';
      case 'Decoración':
        return '🏡';
      case 'Demostración':
        return '🎭';
      default:
        return '📦';
    }
  };

 const getApproachInfo = (approach: Entrepreneurship['approach']) => {
  const approaches = {
    social: { label: 'Social', color: 'bg-green-100 text-green-800' },
    ambiental: { label: 'Ambiental', color: 'bg-blue-100 text-blue-800' }, // CAMBIO AQUI: "ambiental"
    cultural: { label: 'Cultural', color: 'bg-purple-100 text-purple-800' }
  };
  return approaches[approach] || { label: 'Sin enfoque', color: 'bg-gray-100 text-gray-800' };
};

  return (
    <GenericModal show={show} onClose={onClose} title="Detalles del Emprendedor" size="xl" maxHeight>
      <div className="entrepreneur-details">
        <div className="entrepreneur-details__header">
          <h3 className="entrepreneur-details__name">
            {entrepreneur.person?.first_name} {entrepreneur.person?.second_name} {entrepreneur.person?.first_lastname} {entrepreneur.person?.second_lastname}
          </h3>
          <span className={`entrepreneur-details__status entrepreneur-details__status--${entrepreneur.status}`}>
            {entrepreneur.status === 'pending' ? 'Pendiente' : entrepreneur.status === 'approved' ? 'Aprobado' : 'Rechazado'}
          </span>
        </div>

        {/* Sección de Datos Personales */}
        <div className="entrepreneur-details__section">
          <h4 className="entrepreneur-details__section-title">Datos Personales</h4>
          <div className="entrepreneur-details__info-grid">
            <div className="entrepreneur-details__info-item">
              <span className="entrepreneur-details__label">Email</span>
              <p className="entrepreneur-details__text">{entrepreneur.person?.email}</p>
            </div>
            {entrepreneur.person?.phones && entrepreneur.person.phones.length > 0 && (
              <div className="entrepreneur-details__info-item">
                <span className="entrepreneur-details__label">Teléfonos</span>
                <div className="entrepreneur-details__phone-list">
                  {entrepreneur.person.phones.map((phone, index) => (
                    <p key={index} className="entrepreneur-details__text">
                      {phone.number} ({phone.type === 'personal' ? 'Personal' : 'Negocio'})
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="entrepreneur-details__info-item">
              <span className="entrepreneur-details__label">Experiencia (años)</span>
              <p className="entrepreneur-details__text">{entrepreneur.experience}</p>
            </div>
          </div>
        </div>

         {/* Sección de Redes Sociales */}
        {(entrepreneur.facebook_url || entrepreneur.instagram_url) && (
          <div className="entrepreneur-details__section">
            <h4 className="entrepreneur-details__section-title">Redes Sociales</h4>
            <div className="entrepreneur-details__social-media">
              {entrepreneur.facebook_url && (
                <a href={entrepreneur.facebook_url} target="_blank" rel="noopener noreferrer" className="entrepreneur-details__social-item">
                  <div className="entrepreneur-details__social-icon entrepreneur-details__social-icon--facebook">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="entrepreneur-details__social-content">
                    <span className="entrepreneur-details__label">Facebook</span>
                    <p className="entrepreneur-details__text">{entrepreneur.facebook_url}</p>
                  </div>
                </a>
              )}

              {entrepreneur.instagram_url && (
                <a href={entrepreneur.instagram_url} target="_blank" rel="noopener noreferrer" className="entrepreneur-details__social-item">
                  <div className="entrepreneur-details__social-icon entrepreneur-details__social-icon--instagram">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div className="entrepreneur-details__social-content">
                    <span className="entrepreneur-details__label">Instagram</span>
                    <p className="entrepreneur-details__text">{entrepreneur.instagram_url}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Sección de Emprendimiento */}
        {entrepreneur.entrepreneurship && (
          <div className="entrepreneur-details__section">
            <h4 className="entrepreneur-details__section-title">Detalles del Emprendimiento</h4>
            <div className="entrepreneur-details__info-grid">
              <div className="entrepreneur-details__info-item">
                <span className="entrepreneur-details__label">Nombre</span>
                <p className="entrepreneur-details__text">{entrepreneur.entrepreneurship.name}</p>
              </div>
              <div className="entrepreneur-details__info-item">
                <span className="entrepreneur-details__label">Descripción</span>
                <p className="entrepreneur-details__text">{entrepreneur.entrepreneurship.description}</p>
              </div>
              <div className="entrepreneur-details__info-item">
                <span className="entrepreneur-details__label">Ubicación</span>
                <p className="entrepreneur-details__text">{entrepreneur.entrepreneurship.location}</p>
              </div>
              <div className="entrepreneur-details__info-item">
                <span className="entrepreneur-details__label">Categoría</span>
                <div className="entrepreneur-details__category">
                  <span className="entrepreneur-details__category-icon">
                    {getCategoryIcon(entrepreneur.entrepreneurship.category)}
                  </span>
                  <p className="entrepreneur-details__text">{entrepreneur.entrepreneurship.category}</p>
                </div>
              </div>
              {entrepreneur.entrepreneurship.approach && (
                <div className="entrepreneur-details__info-item">
                  <span className="entrepreneur-details__label">Enfoque</span>
                  <span className={`entrepreneur-details__approach ${getApproachInfo(entrepreneur.entrepreneurship.approach).color}`}>
                    {getApproachInfo(entrepreneur.entrepreneurship.approach).label}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sección de Imágenes */}
        {entrepreneur.entrepreneurship && (entrepreneur.entrepreneurship.url_1 || entrepreneur.entrepreneurship.url_2 || entrepreneur.entrepreneurship.url_3) && (
          <div className="entrepreneur-details__section">
            <h4 className="entrepreneur-details__section-title">Imágenes del Emprendimiento</h4>
            <div className="entrepreneur-details__images">
              {entrepreneur.entrepreneurship.url_1 && (
                <div className="entrepreneur-details__image-container">
                  <img
                    src={entrepreneur.entrepreneurship.url_1}
                    alt="Imagen 1 del emprendimiento"
                    className="entrepreneur-details__image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {entrepreneur.entrepreneurship.url_2 && (
                <div className="entrepreneur-details__image-container">
                  <img
                    src={entrepreneur.entrepreneurship.url_2}
                    alt="Imagen 2 del emprendimiento"
                    className="entrepreneur-details__image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {entrepreneur.entrepreneurship.url_3 && (
                <div className="entrepreneur-details__image-container">
                  <img
                    src={entrepreneur.entrepreneurship.url_3}
                    alt="Imagen 3 del emprendimiento"
                    className="entrepreneur-details__image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pie de página con IDs */}
        <div className="entrepreneur-details__footer">
          <div className="entrepreneur-details__footer-info">
            <p className="entrepreneur-details__footer-text">
              ID del Emprendedor: #{entrepreneur.id_entrepreneur}
            </p>
            {entrepreneur.person?.id_person && (
              <p className="entrepreneur-details__footer-text">
                ID de Persona: #{entrepreneur.person.id_person}
              </p>
            )}
            {entrepreneur.registration_date && (
                <p className="entrepreneur-details__footer-text">
                  Fecha de registro: {formatDate(entrepreneur.registration_date)}
                </p>
            )}
          </div>
        </div>
      </div>
    </GenericModal>
  );
};

export default EntrepreneurDetailsModal;