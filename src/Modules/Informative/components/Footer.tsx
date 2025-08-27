import React, { useState } from 'react';

type Member = {
  name: string;
  role: string;
  photo?: string;
};

const board: Member[] = [
  { name: 'Sra. Lizbeth Cerdas Dinarte', role: 'Presidente' },
  { name: 'Lic. ', role: 'Vicepresidente' },
  { name: 'Sr. ', role: 'Fiscal' },
  { name: 'Ing. ', role: 'Coordinador' },
  { name: 'Sr. ', role: 'Contador' },
];

const devTeam: Member[] = [
  { name: 'Roberto Campos Calvo', role: 'Estudiante — UNA' },
  { name: 'Sebastian Campos Calvo', role: 'Estudiante — UNA' },
  { name: 'Brandon Núñez Corrales', role: 'Estudiante — UNA' },
  { name: 'Jose Andres Picado Zamora', role: 'Estudiante — UNA' },
  { name: 'Billy Ugalde Villagra', role: 'Estudiante — UNA' },
];

const Footer: React.FC = () => {
  const [showTeam, setShowTeam] = useState(false);
  const [showUna, setShowUna] = useState(false);

  // Cierra si se hace clic en el overlay (fuera del card)
  const closeOnOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowTeam(false);
      setShowUna(false);
    }
  };

  return (
    <footer>
      <div className="footer-content">
        {/* Links superiores */}
        <div className="footer-links">
          <a href="#hero">Inicio</a>
          <a href="#noticias">Noticias</a>
          <a href="#eventos">Eventos</a>
          <a href="#proyectos">Proyectos</a>
          <a href="#entrepreneurs">Emprendedores</a>
          <a href="#involve">Involúcrate</a>
          <a href="#">Contacto</a>
          <a href="#">Políticas de Privacidad</a>
        </div>

        {/* BARRA INFERIOR: redes (izquierda) + CTAs (derecha) */}
        <div className="footer-bar-bottom">
          <div className="footer-socials">
            <a
              className="social-link whatsapp"
              href="https://api.whatsapp.com/send?phone=50664612741"
              aria-label="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true">
                <path d="M20.52 3.48A11.77 11.77 0 0 0 12.04 0C5.49 0 .2 5.29.2 11.84c0 2.08.54 4.1 1.56 5.9L0 24l6.42-1.67a11.75 11.75 0 0 0 5.62 1.44h.01c6.55 0 11.84-5.29 11.84-11.84 0-3.17-1.23-6.16-3.37-8.45zm-8.48 18.1h-.01a9.85 9.85 0 0 1-5.02-1.38l-.36-.21-3.81.99 1.02-3.71-.24-.38A9.83 9.83 0 0 1 2.2 11.84c0-5.42 4.41-9.83 9.85-9.83 2.63 0 5.1 1.02 6.96 2.88a9.78 9.78 0 0 1 2.88 6.95c0 5.43-4.41 9.84-9.85 9.84zm5.4-7.35c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5 0 1.47 1.08 2.89 1.23 3.09.15.2 2.13 3.26 5.16 4.57.72.31 1.29.5 1.73.64.73.23 1.39.2 1.92.12.59-.09 1.77-.72 2.02-1.43.25-.71.25-1.31.17-1.44-.07-.13-.27-.2-.57-.35z" />
              </svg>
            </a>

            <a
              className="social-link instagram"
              href="https://www.instagram.com/tamarindoparkfoundation/"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true">
                <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.06 1.96.24 2.64.52a5.3 5.3 0 0 1 1.92 1.25 5.3 5.3 0 0 1 1.25 1.92c.28.68.46 1.47.52 2.64.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.24 1.96-.52 2.64a5.3 5.3 0 0 1-1.25 1.92 5.3 5.3 0 0 1-1.92 1.25c-.68.28-1.47.46-2.64.52-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.06-1.96-.24-2.64-.52a5.3 5.3 0 0 1-1.92-1.25 5.3 5.3 0 0 1-1.25-1.92c-.28-.68-.46-1.47-.52-2.64C2.2 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.06-1.17.24-1.96.52-2.64A5.3 5.3 0 0 1 4.04 2.59 5.3 5.3 0 0 1 5.96 1.35c.68-.28 1.47-.46 2.64-.52C9.87 2.21 10.25 2.2 12 2.2zm0 1.8c-3.17 0-3.55.01-4.8.07-1.03.05-1.6.22-1.97.36-.5.19-.86.42-1.25.81-.39.39-.62.75-.81 1.25-.14.37-.31.94-.36 1.97-.06 1.25-.07 1.63-.07 4.8s.01 3.55.07 4.8c.05 1.03.22 1.6.36 1.97.19.5.42.86.81 1.25.39.39.75.62 1.25.81.37.14.94.31 1.97.36 1.25.06 1.63.07 4.8.07s3.55-.01 4.8-.07c1.03-.05 1.6-.22 1.97-.36.5-.19.86-.42 1.25-.81.39-.39.62-.75.81-1.25.14-.37.31-.94.36-1.97.06-1.25.07-1.63.07-4.8s-.01-3.55-.07-4.8c-.05-1.03-.22-1.6-.36-1.97-.19-.5-.42-.86-.81-1.25a3.5 3.5 0 0 0-1.25-.81c-.37-.14-.94-.31-1.97-.36-1.25-.06-1.63-.07-4.8-.07zm0 3.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4zm0 7.7a3 3 0 1 0 .001-6.001A3 3 0 0 0 12 15zm5.98-8.69a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2z" />
              </svg>
            </a>

            <a
              className="social-link facebook"
              href="https://www.facebook.com/TamarindoParkFoundation"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true">
                <path d="M22.68 0H1.32C.59 0 0 .59 0 1.32v21.36C0 23.41.59 24 1.32 24h11.49v-9.29H9.69v-3.62h3.12V8.41c0-3.1 1.9-4.79 4.67-4.79 1.33 0 2.47.1 2.8.14v3.25h-1.92c-1.5 0-1.79.71-1.79 1.76v2.31h3.57l-.47 3.62h-3.1V24h6.08c.73 0 1.32-.59 1.32-1.32V1.32C24 .59 23.41 0 22.68 0z" />
              </svg>
            </a>

            <a
              className="social-link youtube"
              href="https://www.youtube.com/@TamarindoParkFoundation"
              aria-label="YouTube"
              target="_blank"
              rel="noopener noreferrer"
              title="YouTube"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true">
                <path d="M9.5 7L15 10.5L9.5 14V7Z" fill="white" />
              </svg>
            </a>
          </div>

          <div className="footer-cta">
            <button className="footer-pill equipo" onClick={() => setShowTeam(true)}>EQUIPO</button>
            <button className="footer-pill una" onClick={() => setShowUna(true)}>UNA</button>
          </div>
        </div>

        {/* Copyright + contacto */}
        <div style={{ marginTop: '1.25rem' }}>
          <p>&copy; 2025 Fundación Tamarindo Park. Todos los derechos reservados.</p>
          <p style={{ marginTop: '0.5rem', opacity: 0.85 }}>
            📧 info@tamarindopark.org &nbsp;|&nbsp; 📞 +506 2653-1234 &nbsp;|&nbsp; 📍 Tamarindo, Guanacaste, Costa Rica
          </p>
        </div>
      </div>

      {/* MODAL EQUIPO */}
      {showTeam && (
        <div
          className="footer-modal"
          onClick={closeOnOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-title"
        >
          <div className="footer-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="footer-modal-close"
              onClick={() => setShowTeam(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <div className="footer-modal-head">
              <h3 id="team-title">Junta Directiva</h3>
            </div>
            <div className="team-grid">
              {board.map((m, i) => (
                <div key={i} className="member-card">
                  <div className="member-avatar">
                    <img
                      src={
                        m.photo ||
                        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop'
                      }
                      alt={m.name}
                    />
                  </div>
                  <div className="member-name">{m.name}</div>
                  <div className="member-role">{m.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL UNA */}
      {showUna && (
        <div
          className="footer-modal"
          onClick={closeOnOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="una-title"
        >
          <div className="footer-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="footer-modal-close"
              onClick={() => setShowUna(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <div className="footer-modal-head">
              <h3 id="una-title">Equipo de Desarrollo — UNA</h3>
            </div>
            <div className="team-grid">
              {devTeam.map((m, i) => (
                <div key={i} className="member-card">
                  <div className="member-avatar">
                    <img
                      src={
                        m.photo ||
                        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop'
                      }
                      alt={m.name}
                    />
                  </div>
                  <div className="member-name">{m.name}</div>
                  <div className="member-role">{m.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
