import React from "react";

type GenericModalProps = {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  maxHeight?: boolean;
};

const GenericModal = ({ 
  show, 
  onClose, 
  title, 
  children, 
  size = 'md',
  maxHeight = false 
}: GenericModalProps) => {
  if (!show) return null;

  // Size mappings
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  };

  const heightClasses = maxHeight 
    ? 'max-h-[90vh] overflow-y-auto' 
    : '';

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    // backdrop
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* panel */}
      <div 
        className={`relative bg-white rounded-lg shadow-lg w-full ${sizeClasses[size]} ${heightClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 text-2xl leading-none bg-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100"
          aria-label="Close modal"
        >
          &times;
        </button>
        
        {/* content */}
        <div className="p-6">
          {/* optional title */}
          {title && (
            <h2 className="mb-6 text-xl font-semibold pr-8">
              {title}
            </h2>
          )}
          
          {/* whatever you pass in */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default GenericModal;