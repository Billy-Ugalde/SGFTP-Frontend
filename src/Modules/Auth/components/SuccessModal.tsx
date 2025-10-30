import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import '../styles/SuccessModal.css';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="success-modal-overlay" onClick={onClose}>
            <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                <button className="success-modal__close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="success-modal__content">
                    <div className="success-modal__icon">
                        <CheckCircle size={36} />
                    </div>

                    <h3 className="success-modal__title">{title}</h3>
                    <p className="success-modal__message">{message}</p>

                    <button className="success-modal__button" onClick={onClose}>
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;