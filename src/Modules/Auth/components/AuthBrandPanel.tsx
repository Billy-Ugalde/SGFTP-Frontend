import React from 'react';
import '../styles/auth-split.css';

const AuthBrandPanel: React.FC = () => {
  return (
    <aside className="auth-split__brand">
      <div className="auth-split__brand-inner">
        <img
          src="/turtle-icon-white.svg"
          alt="Tamarindo Park Foundation"
          className="auth-split__brand-mark"
        />
        <div className="auth-split__brand-wordmark">
          Tamarindo Park
          <span>Foundation</span>
        </div>
        <p className="auth-split__brand-tagline">Tu voz, nuestro proyecto</p>
      </div>
    </aside>
  );
};

export default AuthBrandPanel;
