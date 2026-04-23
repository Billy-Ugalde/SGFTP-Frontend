import React from 'react';
import '../Styles/NewsAdmin.css';

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<Props> = ({ title, onClose, children }) => {
  return (
    <div className="news-modal__overlay">
      <div className="news-modal__dialog">
        <div className="news-modal__header">
          <h3 className="news-modal__title">{title}</h3>
          <button type="button" onClick={onClose} className="news-modal__close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="news-modal__body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
