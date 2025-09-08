import type { Entrepreneur, EntrepreneurUpdateData } from '../Services/EntrepreneursServices';
import '../Styles/EditEntrepreneurForm.css';

interface EditPersonalDataStepProps {
  entrepreneur: Entrepreneur;
  formValues: Omit<EntrepreneurUpdateData, 'id_entrepreneur'>;
  onNext: () => void;
  onCancel: () => void;
  renderField: (name: keyof Omit<EntrepreneurUpdateData, 'id_entrepreneur'> | 'phones[0].number', config?: any) => React.ReactNode;
}

const EditPersonalDataStep = ({ entrepreneur, formValues, onNext, onCancel, renderField }: EditPersonalDataStepProps) => {
  const handleNext = () => {
    // Basic validation for step 1
    if (
      !formValues.first_name ||
      !formValues.first_lastname ||
      !formValues.second_lastname ||
      !formValues.email ||
      !formValues.phones ||
      !formValues.phones[0]?.number ||
      formValues.experience === 0
    ) {
      alert('Por favor completa todos los campos obligatorios del paso 1.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValues.email)) {
      alert('Por favor ingresa un email válido.');
      return;
    }
    
    // Phone validation
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(formValues.phones[0].number)) {
      alert('Por favor ingresa un número de teléfono válido (solo números y el signo +).');
      return;
    }
    
    onNext();
  };

  return (
    <div className="edit-entrepreneur-form__step-content">
      <div className="edit-entrepreneur-form__step-header">
        <div className="edit-entrepreneur-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="edit-entrepreneur-form__step-title">Información Personal</h3>
          <p className="edit-entrepreneur-form__step-description">
            Actualiza los datos personales del emprendedor
          </p>
        </div>
      </div>

      {/* Personal Information Fields */}
      <div className="edit-entrepreneur-form__fields">
        {/* Names */}
        <div className="edit-entrepreneur-form__row">
          {renderField('first_name', {
            validators: {
              onChange: ({ value }: { value: string }) => !value ? 'El primer nombre es obligatorio' : undefined,
            },
            label: 'Primer Nombre',
            required: true,
            placeholder: 'Ingresa el primer nombre'
          })}

          {renderField('second_name', {
            label: 'Segundo Nombre',
            placeholder: 'Segundo nombre (opcional)'
          })}
        </div>

        <div className="edit-entrepreneur-form__row">
          {renderField('first_lastname', {
            validators: {
              onChange: ({ value }: { value: string }) => !value ? 'El primer apellido es obligatorio' : undefined,
            },
            label: 'Primer Apellido',
            required: true,
            placeholder: 'Primer apellido'
          })}

          {renderField('second_lastname', {
            validators: {
              onChange: ({ value }: { value: string }) => !value ? 'El segundo apellido es obligatorio' : undefined,
            },
            label: 'Segundo Apellido',
            required: true,
            placeholder: 'Segundo apellido'
          })}
        </div>

        {/* Contact Information */}
        {renderField('email', {
          validators: {
            onChange: ({ value }: { value: string }) => {
              if (!value) return 'El email es obligatorio';
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Formato de email inválido';
              return undefined;
            },
          },
          label: 'Email',
          required: true,
          type: 'email',
          placeholder: 'correo@ejemplo.com',
          withIcon: true,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )
        })}

        {renderField('phones[0].number', {
          validators: {
            onChange: ({ value }: { value: string }) => {
              if (!value) return 'El teléfono es obligatorio';
              if (!/^[\+]?[\d\s\-\(\)]+$/.test(value)) return 'Solo números y el signo + son permitidos';
              return undefined;
            },
          },
          label: 'Teléfono',
          required: true,
          type: 'tel',
          placeholder: '+506 8888-8888',
          withIcon: true,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          )
        })}

        {/* Experience */}
        {renderField('experience', {
          validators: {
            onChange: ({ value }: { value: number }) => {
              if (!value || value === 0) return 'La experiencia es obligatoria';
              if (value < 0) return 'La experiencia no puede ser negativa';
              if (value > 70) return 'Por favor ingresa un valor válido';
              return undefined;
            },
          },
          label: 'Años de Experiencia Empresarial',
          required: true,
          type: 'number',
          min: 0,
          max: 70,
          placeholder: 'Años de experiencia',
          withIcon: true,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          helpText: 'Ingresa el número de años de experiencia en emprendimientos o negocios'
        })}
         {/* Social Media URLs */}
        <div className="edit-entrepreneur-form__section">
          <h4 className="edit-entrepreneur-form__section-title">Redes Sociales</h4>
          <p className="edit-entrepreneur-form__section-description">
            Actualiza los enlaces a las redes sociales del emprendimiento
          </p>
          
          {renderField('facebook_url', {
            validators: {
              onChange: ({ value }: { value: string }) => {
                if (value && !/^https?:\/\/(www\.)?(facebook|fb)\.com\/.+/i.test(value)) {
                  return 'Debe ser una URL válida de Facebook (ejemplo: https://facebook.com/tupagina)';
                }
                return undefined;
              },
            },
            label: 'Facebook',
            type: 'url',
            placeholder: 'https://facebook.com/tuemprendimiento',
            helpText: entrepreneur.facebook_url ? `Actual: ${entrepreneur.facebook_url}` : 'No configurado',
            withIcon: true,
            icon: (
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )
          })}

          {renderField('instagram_url', {
            validators: {
              onChange: ({ value }: { value: string }) => {
                if (value && !/^https?:\/\/(www\.)?instagram\.com\/.+/i.test(value)) {
                  return 'Debe ser una URL válida de Instagram (ejemplo: https://instagram.com/tuusuario)';
                }
                return undefined;
              },
            },
            label: 'Instagram',
            type: 'url',
            placeholder: 'https://instagram.com/tuemprendimiento',
            helpText: entrepreneur.instagram_url ? `Actual: ${entrepreneur.instagram_url}` : 'No configurado',
            withIcon: true,
            icon: (
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            )
          })}
        </div>
      </div>
      
      <div className="edit-entrepreneur-form__step-actions">
        <button
          type="button"
          onClick={onCancel}
          className="edit-entrepreneur-form__cancel-btn"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="edit-entrepreneur-form__next-btn"
        >
          Siguiente: Emprendimiento
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EditPersonalDataStep;