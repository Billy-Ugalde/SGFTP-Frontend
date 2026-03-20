import React, { useState } from 'react';
import AddDonorForm from './AddDonorForm';
import { useCreateDonation } from '../Services/DonorService';
import type { CreateDonationDto } from '../Services/DonorService';

interface DonorPublicFormProps {
  onClose: () => void;
}

const DonorPublicForm: React.FC<DonorPublicFormProps> = ({ onClose }) => {
  const createDonation = useCreateDonation();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (data: CreateDonationDto) => {
    await createDonation.mutateAsync(data);
    setShowSuccess(true);

    // Cerrar el modal después de 2 segundos
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '3rem 2rem',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem',
          }}>
            ✓
          </div>
          <h2 style={{
            color: '#0f172a',
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: '0 0 1rem 0',
          }}>
            ¡Donación Registrada!
          </h2>
          <p style={{
            color: '#475569',
            fontSize: '1rem',
            lineHeight: 1.6,
            margin: 0,
          }}>
            Gracias por tu interés en apoyarnos. Hemos recibido tu información y nos pondremos en contacto contigo pronto para coordinar la donación.
          </p>
        </div>
      </div>
    );
  }

  return <AddDonorForm onSubmit={handleSubmit} onCancel={onClose} />;
};

export default DonorPublicForm;
