import React from "react";

type GenericModalProps = {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  maxHeight?: boolean;
};

const GenericModal = ({ show, onClose, title, children, size = 'md', maxHeight = false }: GenericModalProps) => {
  if (!show) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  };

  const heightClasses = maxHeight ? 'max-h-[90vh] overflow-y-auto' : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`relative bg-white rounded-lg shadow-lg w-full ${sizeClasses[size]} ${heightClasses}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-800">&times;</button>
        <div className="p-6">
          {title && <h2 className="mb-6 text-xl font-semibold">{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default GenericModal;
