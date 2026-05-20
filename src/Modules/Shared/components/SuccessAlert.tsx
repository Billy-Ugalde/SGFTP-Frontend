import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle } from 'lucide-react';
import '../styles/SuccessAlert.css';

interface SuccessAlertContextType {
  showSuccess: (message: string) => void;
}

const SuccessAlertContext = createContext<SuccessAlertContextType>({
  showSuccess: () => {},
});

export function useSuccessAlert() {
  return useContext(SuccessAlertContext);
}

const DURATION = 3500;

interface AlertModalProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ show, message, onClose }) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, DURATION);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return createPortal(
    <div className="success-alert" onClick={onClose}>
      <div className="success-alert__backdrop" />
      <div
        className="success-alert__card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="success-alert__icon-wrapper">
          <CheckCircle size={40} strokeWidth={2} />
        </div>
        <p className="success-alert__title">¡Operación exitosa!</p>
        <p className="success-alert__message">{message}</p>
        <div className="success-alert__progress">
          <div className="success-alert__progress-bar" />
        </div>
      </div>
    </div>,
    document.body
  );
};

export function SuccessAlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const showSuccess = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <SuccessAlertContext.Provider value={{ showSuccess }}>
      {children}
      <AlertModal show={visible} message={message} onClose={handleClose} />
    </SuccessAlertContext.Provider>
  );
}
