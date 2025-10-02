// src/Modules/Informative/Public/components/Footer.tsx
import React, { useState } from 'react';
// Junta directiva images (fallbacks locales)
import presidentaImg from '../../../../assets/Presidenta.jpg';
import tesoreraImg from '../../../../assets/Tesorera.jpg';
import directorImg from '../../../../assets/Director_ejecutivo.jpg';
import secretarioImg from '../../../../assets/Secretario.jpg';
import vocalImg from '../../../../assets/Vocal.jpg';
import vicepresidentaIMg from '../../../../assets/Vicepresidenta.jpg';

// Equipo de desarrollo images (sin cambios)
import devBrandon from '../../../../assets/Brandon.png';
import devJose from '../../../../assets/Jose.png';
import devRoberto from '../../../../assets/Roberto.png';
import devSebastian from '../../../../assets/Sebastian.png';
import devBilly from '../../../../assets/Billy.png';

import { useSectionContent } from '../../Admin/services/contentBlockService';
import { useContactInfo } from '../../Admin/services/contactInfoService'; // ⬅️ MISMO hook del admin

/* ====================== Config & helpers ====================== */
const API_BASE: string =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_URL) ||
  (typeof window !== 'undefined' && (window as any).__API_BASE__) ||
  'http://localhost:3001';

// Función para convertir URL de Drive al formato proxy (igual que en Entrepreneurs)
const getProxyImageUrl = (url: string): string => {
  if (!url) return '';

  // Si ya es una URL de proxy, devolverla tal cual
  if (url.includes('/images/proxy')) return url;

  // Si es una URL de Google Drive, usar el proxy
  if (url.includes('drive.google.com')) {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? window.location.origin
      : 'http://localhost:3001';
    return `${baseUrl}/images/proxy?url=${encodeURIComponent(url)}`;
  }

  // Para otras URLs, devolver tal cual
  return url;
};

const resolveUrl = (u: string): string => {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  const path = u.startsWith('/') ? u.slice(1) : u;
  return `${API_BASE.replace(/\/+$/, '')}/${path}`;
};

// Helper para procesar URLs de imágenes
const processImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // URLs de Google Drive usan el proxy
  if (trimmed.includes('drive.google.com')) {
    return getProxyImageUrl(trimmed);
  }

  // URLs absolutas se devuelven tal cual
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // URLs relativas se convierten a absolutas
  return resolveUrl(trimmed);
};

type Member = {
  name: string;
  role: string;
  photo?: string | null;
};

const boardFallback: Member[] = [
  { name: 'Sra. Lizbeth Cerdas Dinarte', role: 'Presidenta',            photo: presidentaImg },
  { name: 'Yuly Viviana Arenas Vargas',  role: 'Vice-Presidenta',       photo: vicepresidentaIMg },
  { name: 'Brandon Barrantes Corea',     role: 'Director ejecutivo',     photo: directorImg   },
  { name: 'Melissa Vargas Vargas',       role: 'Tesorera',               photo: tesoreraImg   },
  { name: 'Carlos Roberto Pizarro Barrantes', role: 'Secretario',        photo: secretarioImg },
  { name: 'Leonel Francisco Peralta Barrantes', role: 'Vocal',           photo: vocalImg      },
];

const devTeam: Member[] = [
  { name: 'Roberto Campos Calvo',         role: 'Estudiante — UNA', photo: devRoberto },
  { name: 'Sebastian Campos Calvo',       role: 'Estudiante — UNA', photo: devSebastian },
  { name: 'Brandon Núñez Corrales',       role: 'Estudiante — UNA', photo: devBrandon },
  { name: 'Jose Andres Picado Zamora',    role: 'Estudiante — UNA', photo: devJose },
  { name: 'Billy Fabián Ugalde Villagra', role: 'Estudiante — UNA', photo: devBilly },
];

const Footer: React.FC = () => {
  const [showTeam, setShowTeam] = useState(false);
  const [showUna, setShowUna] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);

  const closeOnOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowTeam(false);
      setShowUna(false);
    }
  };

  // ======= CONTENIDO DINÁMICO DESDE EL BACKEND =======
  // Junta directiva (home/board_members)
  const { data: boardData } = useSectionContent('home', 'board_members');

  // Contacto + Redes
  const { data: contactInfo } = useContactInfo();

  // ---- Junta: combinamos backend + fallbacks locales ----
  const boardResolved: Member[] = React.useMemo(() => {
    const get = (k: string) => (boardData?.[k] ?? '') as string;

    const list: Member[] = [
      { name: get('president_name')        || boardFallback[0].name, role: boardFallback[0].role, photo: get('president_photo')        || boardFallback[0].photo },
      { name: get('vice_president_name')   || boardFallback[1].name, role: boardFallback[1].role, photo: get('vice_president_photo')   || boardFallback[1].photo },
      { name: get('director_name')         || boardFallback[2].name, role: boardFallback[2].role, photo: get('director_photo')         || boardFallback[2].photo },
      { name: get('treasurer_name')        || boardFallback[3].name, role: boardFallback[3].role, photo: get('treasurer_photo')        || boardFallback[3].photo },
      { name: get('secretary_name')        || boardFallback[4].name, role: boardFallback[4].role, photo: get('secretary_photo')        || boardFallback[4].photo },
      { name: get('vocal_name')            || boardFallback[5].name, role: boardFallback[5].role, photo: get('vocal_photo')            || boardFallback[5].photo },

      // Nuevos (si no hay nombre, NO se muestran)
      { name: get('executive_representative_name') || '', role: 'Representante del Poder ejecutivo', photo: get('executive_representative_photo') || null },
      { name: get('municipal_representative_name') || '', role: 'Representante Municipal',           photo: get('municipal_representative_photo') || null },
      { name: get('coordinator_name')              || '', role: 'Coordinador',                       photo: get('coordinator_photo')              || null },
    ];

    return list.filter(m => m.name && m.name.trim().length > 0);
  }, [boardData]);

  // ---- Contacto básico: backend -> UI (con fallbacks actuales) ----
  const contactResolved = React.useMemo(() => {
    const email   = (contactInfo?.email   ?? 'info@tamarindoparkfoundation.com') as string;
    const phone   = (contactInfo?.phone   ?? '+506 2653-1234') as string;
    const address = (contactInfo?.address ?? 'Tamarindo, Guanacaste, Costa Rica') as string;
    return { email, phone, address };
  }, [contactInfo]);

  // ---- URL de Maps para el enlace de dirección ----
  const gm = (contactInfo?.google_maps_url ?? '') as string;

  // Dirección que funciona como enlace si gm existe; si no, texto plano
  const addressLink = React.useMemo(() => {
    return gm && /^https?:\/\//i.test(gm) ? (
      <a
        href={gm}
        target="_blank"
        rel="noopener noreferrer"
        className="footer-link"
        aria-label={`Abrir mapa de ${contactResolved.address}`}
      >
        {contactResolved.address}
      </a>
    ) : (
      <span>{contactResolved.address}</span>
    );
  }, [gm, contactResolved.address]);

  // ---- Redes sociales: backend -> UI (con fallbacks actuales) ----
  const linksResolved = React.useMemo(() => {
    const fb  = (contactInfo?.facebook_url   ?? 'https://www.facebook.com/TamarindoParkFoundation') as string;
    const ig  = (contactInfo?.instagram_url  ?? 'https://www.instagram.com/tamarindoparkfoundation/') as string;
    const wa  = (contactInfo?.whatsapp_url   ?? 'https://api.whatsapp.com/send?phone=50664612741') as string;
    const yt  = (contactInfo?.youtube_url    ?? 'https://www.youtube.com/@TamarindoParkFoundation') as string;
    return { fb, ig, wa, yt };
  }, [contactInfo]);
  // =====================================================

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-links">
          <a href="#hero">Inicio</a>
          <a href="#noticias">Noticias</a>

          {/* Dropdown: Eventos (Próximos / Realizados) */}
          <div
            className="dropdown"
            onMouseEnter={() => setEventsOpen(true)}
            onMouseLeave={() => setEventsOpen(false)}
          >
            <button
              className="dropdown-trigger"
              onClick={() => setEventsOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={eventsOpen}
            >
              Eventos <span className="caret">▾</span>
            </button>

            <ul className={`dropdown-menu ${eventsOpen ? 'show' : ''}`} role="menu">
              <li role="none">
                <a role="menuitem" href="#eventos" onClick={() => setEventsOpen(false)}>
                  Próximos
                </a>
              </li>
              <li role="none">
                <a role="menuitem" href="#proyectos" onClick={() => setEventsOpen(false)}>
                  Realizados
                </a>
              </li>
            </ul>
          </div>

          <a href="#fairs">Ferias</a>
          <a href="#emprendedores">Emprendedores</a>
          <a href="#involve">Involúcrate</a>
          <a href="">Políticas de Privacidad</a>
        </div>

        <div className="footer-bar-bottom">
          <div className="footer-socials">
            {/* WhatsApp */}
            <a
              className="social-link whatsapp"
              href={linksResolved.wa}
              aria-label="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true">
                <path d="M20.52 3.48A11.77 11.77 0 0 0 12.04 0C5.49 0 .2 5.29.2 11.84c0 2.08.54 4.1 1.56 5.9L0 24l6.42-1.67a11.75 11.75 0 0 0 5.62 1.44h.01c6.55 0 11.84-5.29 11.84-11.84 0-3.17-1.23-6.16-3.37-8.45zm-8.48 18.1h-.01a9.85 9.85 0 0 1-5.02-1.38l-.36-.21-3.81.99 1.02-3.71-.24-.38A9.83 9.83 0 0 1 2.2 11.84c0-5.42 4.41-9.83 9.85-9.83 2.63 0 5.1 1.02 6.96 2.88a9.78 9.78 0 0 1 2.88 6.95c0 5.43-4.41 9.84-9.85 9.84zm5.4-7.35c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5 0 1.47 1.08 2.89 1.23 3.09.15.2 2.13 3.26 5.16 4.57.72.31 1.29.5 1.73.64.73.23 1.39.2 1.92.12.59-.09 1.77-.72 2.02-1.43.25-.71.25-1.31.17-1.44-.07-.13-.27-.2-.57-.35z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              className="social-link instagram"
              href={linksResolved.ig}
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true">
                <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.06 1.96.24 2.64.52a5.3 5.3 0 0 1 1.92 1.25 5.3 5.3 0 0 1 1.25 1.92c.28.68.46 1.47.52 2.64.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.24 1.96-.52 2.64a5.3 5.3 0 0 1-1.25 1.92 5.3 5.3 0 0 1-1.92 1.25c-.68.28-1.47.46-2.64.52-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.06-1.96-.24-2.64-.52a5.3 5.3 0 0 1-1.92-1.25 5.3 5.3 0 0 1-1.25-1.92c-.28-.68-.46-1.47-.52-2.64C2.2 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.06-1.17.24-1.96.52-2.64A5.3 5.3 0 0 1 4.04 2.59 5.3 5.3 0 0 1 5.96 1.35c.68-.28 1.47-.46 2.64-.52C9.87 2.21 10.25 2.2 12 2.2zm0 1.8c-3.17 0-3.55.01-4.8.07-1.03.05-1.6.22-1.97.36-.5.19-.86.42-1.25.81-.39.39-.62.75-.81 1.25-.14.37-.31.94-.36 1.97-.06 1.25-.07 1.63-.07 4.8s.01 3.55.07 4.8c.05 1.03.22 1.6.36 1.97.19.5.42.86.81 1.25.39.39.75.62 1.25.81.37.14.94.31 1.97.36 1.25.06 1.63.07 4.8.07s3.55-.01 4.8-.07c1.03-.05 1.6-.22 1.97-.36.5-.19.86-.42 1.25-.81.39-.39.62-.75.81-1.25.14-.37.31-.94.36-1.97.06-1.25.07-1.63.07-4.8s-.01-3.55-.07-4.8c-.05-1.03-.22-1.6-.36-1.97-.19-.5-.42-.86-.81-1.25a3.5 3.5 0 0 0-1.25-.81c-.37-.14-.94-.31-1.97-.36-1.25-.06-1.63-.07-4.8-.07zm0 3.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4zm0 7.7a3 3 0 1 0 .001-6.001A3 3 0 0 0 12 15zm5.98-8.69a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              className="social-link facebook"
              href={linksResolved.fb}
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true">
                <path d="M22.68 0H1.32C.59 0 0 .59 0 1.32v21.36C0 23.41.59 24 1.32 24h11.49v-9.29H9.69v-3.62h3.12V8.41c0-3.1 1.9-4.79 4.67-4.79 1.33 0 2.47.1 2.8.14v3.25h-1.92c-1.5 0-1.79.71-1.79 1.76v2.31h3.57l-.47 3.62h-3.1V24h6.08c.73 0 1.32-.59 1.32-1.32V1.32C24 .59 23.41 0 22.68 0z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              className="social-link youtube"
              href={linksResolved.yt}
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
            <button className="footer-pill equipo" onClick={() => setShowTeam(true)}>
              JUNTA DIRECTIVA
            </button>
            {/* Siempre modal, nunca link externo */}
            <button className="footer-pill una" onClick={() => setShowUna(true)}>
              UNA
            </button>
          </div>
        </div>

        {/* Línea de contacto inferior (ahora dinámica) */}
        <div style={{ marginTop: '1.25rem' }}>
          <p>&copy; 2025 Fundación Tamarindo Park. Todos los derechos reservados.</p>
          <p style={{ marginTop: '0.5rem', opacity: 0.85 }}>
            📧 {contactResolved.email} &nbsp;|&nbsp; 📞 {contactResolved.phone} &nbsp;|&nbsp; 📍 {addressLink}
          </p>
        </div>
      </div>

      {/* Modal Junta Directiva */}
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
              {boardResolved.map((m, i) => (
                <div key={i} className="member-card">
                  <div className="member-avatar">
                    {/* Evitar src="" para no disparar warnings */}
                    {m.photo ? <img src={m.photo} alt={m.name} /> : <div aria-hidden="true" />}
                  </div>
                  <div className="member-name">{m.name}</div>
                  <div className="member-role">{m.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal UNA (sin cambios de lógica; prevenir warning de src="" también) */}
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
                    {m.photo ? <img src={m.photo} alt={m.name} /> : <div aria-hidden="true" />}
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
