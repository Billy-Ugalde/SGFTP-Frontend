import React, { useEffect, useRef} from "react";
import '../Styles/GenericModal.css';

type GenericModalProps = {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  maxHeight?: boolean;
  closeOnBackdrop?: boolean;
};

const GenericModal = ({ show, onClose, title, children, size = 'md', maxHeight = false, closeOnBackdrop = false }: GenericModalProps) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef<number>(0);
  const bodyRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && show) {
        onClose();
      }
    };

    if (show) {
      scrollYRef.current = window.scrollY || document.documentElement.scrollTop;
      bodyRef.current = document.body;
    
      document.addEventListener('keydown', handleEscape);
      
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';

      document.body.classList.add('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      
      if (show && bodyRef.current) {
        const body = bodyRef.current;
        body.style.overflow = '';
        body.style.position = '';
        body.style.top = '';
        body.style.left = '';
        body.style.right = '';
        body.style.width = '';

        requestAnimationFrame(() => {
          window.scrollTo(0, scrollYRef.current);
        });
      }
      
      document.body.classList.remove('modal-open');
    };
  }, [show, onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  if (!show) return null;

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'generic-modal__content--sm';
      case 'md': return 'generic-modal__content--md';
      case 'lg': return 'generic-modal__content--lg';
      case 'xl': return 'generic-modal__content--xl';
      case '2xl': return 'generic-modal__content--2xl';
      default: return 'generic-modal__content--md';
    }
  };

  return (
    <div 
      className="generic-modal"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="generic-modal__backdrop" />
      
      {/* Modal */}
      <div 
        ref={modalContentRef}
        className={`generic-modal__content ${getSizeClass()} ${maxHeight ? 'generic-modal__content--max-height' : ''}`}
        onClick={handleContentClick}
      >
        {/* Header */}
        {title && (
          <div className="generic-modal__header">
            <h2 className="generic-modal__title">{title}</h2>
            <button
              onClick={onClose}
              className="generic-modal__close-btn"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={`${title ? 'generic-modal__body' : 'generic-modal__body--no-header'} ${maxHeight ? 'generic-modal__body--max-height' : ''}`}>
          {!title && (
            <button
              onClick={onClose}
              className="generic-modal__close-btn generic-modal__close-btn--no-header"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default GenericModal;