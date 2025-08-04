import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-links">
          <a href="#inicio">Inicio</a>
          <a href="#noticias">Noticias</a>
          <a href="#eventos">Eventos</a>
          <a href="#proyectos">Proyectos</a>
          <a href="#involucrate">Involúcrate</a>
          <a href="#">Contacto</a>
          <a href="#">Políticas de Privacidad</a>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <p>&copy; 2025 Fundación Tamarindo Park. Todos los derechos reservados.</p>
          <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
            📧 info@tamarindopark.org | 📞 +506 2653-1234 | 📍 Tamarindo, Guanacaste, Costa Rica
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
