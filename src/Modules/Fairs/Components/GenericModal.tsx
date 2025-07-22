import React, { useEffect } from "react";

type GenericModalProps = {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  maxHeight?: boolean;
};

const GenericModal = ({ show, onClose, title, children, size = 'md', maxHeight = false }: GenericModalProps) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && show) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose]);

  if (!show) return null;

  const getMaxWidth = () => {
    switch (size) {
      case 'sm': return '28rem';
      case 'md': return '32rem';
      case 'lg': return '48rem';
      case 'xl': return '64rem';
      case '2xl': return '72rem';
      default: return '32rem';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
      
      {/* Modal */}
      <div style={{
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: getMaxWidth(),
        maxHeight: maxHeight ? '90vh' : 'auto',
        overflow: maxHeight ? 'hidden' : 'visible',
        transform: 'scale(1)',
        transition: 'all 0.3s ease-in-out'
      }}>
        {/* Header */}
        {title && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                color: '#9ca3af',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <svg style={{ height: '1.5rem', width: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div style={{
          padding: title ? '1.5rem' : '2rem',
          maxHeight: maxHeight ? 'calc(90vh - 100px)' : 'auto',
          overflowY: maxHeight ? 'auto' : 'visible'
        }}>
          {!title && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                padding: '0.5rem',
                color: '#9ca3af',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <svg style={{ height: '1.5rem', width: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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