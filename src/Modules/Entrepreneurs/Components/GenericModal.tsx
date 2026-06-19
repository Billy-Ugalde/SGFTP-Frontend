import React, { useEffect, useRef} from "react";
import { createPortal } from "react-dom";
import '../Styles/GenericModal.css';

type GenericModalProps = {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  maxHeight?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
};

const GenericModal = ({ show, onClose, title, children, size = 'md', maxHeight = false, closeOnBackdrop = false, className }: GenericModalProps) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!show) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleEscape);
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    body.classList.add('modal-open');

    const mainScroll = document.querySelector<HTMLElement>('.main-scroll');
    const prevMainOverflow = mainScroll?.style.overflow ?? '';
    if (mainScroll) mainScroll.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      body.classList.remove('modal-open');
      if (mainScroll) mainScroll.style.overflow = prevMainOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [show]);

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

  return createPortal(
    <div
      className="generic-modal"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="generic-modal__backdrop" />
      
      {/* Modal */}
      <div 
        ref={modalContentRef}
        className={`generic-modal__content ${getSizeClass()} ${maxHeight ? 'generic-modal__content--max-height' : ''} ${className ?? ''}`}
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
    </div>,
    document.body
  );
};

export default GenericModal;