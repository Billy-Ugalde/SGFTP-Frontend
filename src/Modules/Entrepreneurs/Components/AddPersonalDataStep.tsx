import type { EntrepreneurFormData } from '../Services/EntrepreneursServices';
import '../Styles/AddEntrepreneurForm.css';

interface PersonalDataStepProps {
  formValues: EntrepreneurFormData;
  onNext: () => void;
  onCancel: () => void;
  renderField: (name: keyof EntrepreneurFormData | 'phones[0].number' | 'phones[1].number', config?: any) => React.ReactNode;
}

const PersonalDataStep = ({ formValues, onNext, onCancel, renderField }: PersonalDataStepProps) => {

  return (
    <div className="add-entrepreneur-form__step-content">
      <div className="add-entrepreneur-form__step-header">
        <div className="add-entrepreneur-form__step-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="add-entrepreneur-form__step-title">Información Personal</h3>
          <p className="add-entrepreneur-form__step-description">
            Completa los datos personales del emprendedor
          </p>
        </div>
      </div>

      {/* Personal Information Fields */}
      <div className="add-entrepreneur-form__fields">
        {/* Names */}
        <div className="add-entrepreneur-form__row">
          {renderField('first_name', {
            label: 'Primer Nombre',
            required: true,
            placeholder: 'Ingresa el primer nombre',
            maxLength: 50,
            showCharacterCount: true
          })}

          {renderField('second_name', {
            label: 'Segundo Nombre',
            placeholder: 'Segundo nombre (opcional)',
            maxLength: 50,
            showCharacterCount: true
          })}
        </div>

        <div className="add-entrepreneur-form__row">
          {renderField('first_lastname', {
            label: 'Primer Apellido',
            required: true,
            placeholder: 'Primer apellido',
            maxLength: 50,
            showCharacterCount: true
          })}

          {renderField('second_lastname', {
            label: 'Segundo Apellido',
            required: true,
            placeholder: 'Segundo apellido',
            maxLength: 50,
            showCharacterCount: true
          })}
        </div>

        {/* Contact Information */}
        {renderField('email', {
          label: 'Email',
          required: true,
          type: 'email',
          placeholder: 'correo@ejemplo.com',
          minLength: 6,
          maxLength: 80,
          showCharacterCount: true,
          withIcon: true,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )
        })}

        {renderField('phones[0].number', {
          label: 'Teléfono',
          required: true,
          type: 'tel',
          placeholder: '+506 8888-8888',
          minLength: 8,
          maxLength: 20,
          showCharacterCount: true,
          withIcon: true,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          )
        })}
        {renderField('phones[1].number', {
          label: 'Teléfono de respaldo (Opcional)',
          required: false,
          type: 'tel',
          placeholder: '+506 2222-2222',
          minLength: 8,
          maxLength: 20,
          showCharacterCount: true,
          withIcon: true,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.2.48 2.54.73 3.95.73a1 1 0 011 1v3.5a1 1 0 01-1 1C10.07 22 2 13.93 2 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.41.25 2.75.73 3.95a1 1 0 01-.21 1.11l-2.2 2.2z" />
            </svg>
          )
        })}

        {/* Experience */}
        {renderField('experience', {
          label: 'Años de Experiencia',
          required: true,
          type: 'number',
          min: 0,
          max: 100,
          maxLength: 3,
          placeholder: 'Años de experiencia'
        })}
         
        {/* Social Media URLs */}
        <div className="add-entrepreneur-form__section">
          <h4 className="add-entrepreneur-form__section-title">Redes Sociales (Opcional)</h4>
          <p className="add-entrepreneur-form__section-description">
            Agrega los enlaces a las redes sociales del emprendimiento
          </p>
          
          {renderField('facebook_url', {
            label: 'Facebook',
            type: 'url',
            placeholder: 'https://facebook.com/tuemprendimiento',
            withIcon: true,
            icon: (
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )
          })}

          {renderField('instagram_url', {
            label: 'Instagram',
            type: 'url',
            placeholder: 'https://instagram.com/tuemprendimiento',
            withIcon: true,
            icon: (
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            )
          })}
        </div>
      </div>
      
      
      <div className="add-entrepreneur-form__step-actions">
        <button
          type="button"
          onClick={onCancel}
          className="add-entrepreneur-form__cancel-btn"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onNext}
          className="add-entrepreneur-form__next-btn"
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

export default PersonalDataStep;