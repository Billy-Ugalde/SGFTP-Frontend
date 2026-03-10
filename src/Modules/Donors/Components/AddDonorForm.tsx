import React, { useMemo, useState } from 'react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import type { CreateDonorDto } from '../Services/DonorService';
import '../Styles/DonorForm.css';
import PhoneInputField from '../../../shared/components/PhoneInput/PhoneInputField';
import { validatePhone } from '../../../shared/utils/phone.utils';

interface AddDonorFormProps {
  onSubmit: (data: CreateDonorDto) => Promise<void>;
  onCancel: () => void;
}

const AddDonorForm: React.FC<AddDonorFormProps> = ({ onSubmit, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<CreateDonorDto>({
    first_name: '',
    second_name: '',
    first_lastname: '',
    second_lastname: '',
    Donation_type: '',
    Interest: '',
    Donation_details: '',
    Email: '',
    Phone: '',
  });

  const enumHelp = useMemo(
    () =>
      'Usa el valor exacto del enum definido en el backend (por ejemplo: "ONE_TIME", "MONTHLY", etc.).',
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (error) setError('');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!formData.first_name.trim() || formData.first_name.trim().length < 2) return 'Nombre es obligatorio (mínimo 2 caracteres).';
    if (formData.second_name && formData.second_name.trim().length > 0 && formData.second_name.trim().length < 2) return 'Segundo nombre debe tener al menos 2 caracteres (o déjalo vacío).';
    if (!formData.first_lastname.trim() || formData.first_lastname.trim().length < 2) return 'Primer apellido es obligatorio (mínimo 2 caracteres).';
    if (!formData.second_lastname.trim() || formData.second_lastname.trim().length < 2) return 'Segundo apellido es obligatorio (mínimo 2 caracteres).';
    if (!formData.Donation_type.trim()) return 'Tipo de donación es obligatorio.';
    if (!formData.Interest.trim()) return 'Interés es obligatorio.';
    if (!formData.Donation_details.trim() || formData.Donation_details.trim().length < 10) return 'Detalles de donación es obligatorio (mínimo 10 caracteres).';
    if (!formData.Email.trim()) return 'Email es obligatorio.';
    if (!formData.Phone) return 'Teléfono es obligatorio.';
    if (!validatePhone(formData.Phone)) return 'El número de teléfono no es válido. Selecciona el código de país.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const payload: CreateDonorDto = {
        ...formData,
        first_name: formData.first_name.trim(),
        second_name: formData.second_name?.trim() ? formData.second_name.trim() : undefined,
        first_lastname: formData.first_lastname.trim(),
        second_lastname: formData.second_lastname.trim(),
        Donation_type: formData.Donation_type.trim(),
        Interest: formData.Interest.trim(),
        Donation_details: formData.Donation_details.trim(),
        Email: formData.Email.trim(),
        Phone: formData.Phone.trim(),
      };

      await onSubmit(payload);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al crear el donador.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GenericModal show onClose={onCancel} title="Agregar Donador" size="lg" maxHeight>
      <form onSubmit={handleSubmit}>
        <div className="donor-form__grid">
          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="first_name">Nombre</label>
            <input id="first_name" name="first_name" className="donor-form__input" value={formData.first_name} onChange={handleChange} maxLength={50} required />
          </div>

          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="second_name">Segundo nombre (opcional)</label>
            <input id="second_name" name="second_name" className="donor-form__input" value={formData.second_name || ''} onChange={handleChange} maxLength={50} />
          </div>

          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="first_lastname">Primer apellido</label>
            <input id="first_lastname" name="first_lastname" className="donor-form__input" value={formData.first_lastname} onChange={handleChange} maxLength={50} required />
          </div>

          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="second_lastname">Segundo apellido</label>
            <input id="second_lastname" name="second_lastname" className="donor-form__input" value={formData.second_lastname} onChange={handleChange} maxLength={50} required />
          </div>

          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="Donation_type">Tipo de donación</label>
            <input id="Donation_type" name="Donation_type" className="donor-form__input" value={formData.Donation_type} onChange={handleChange} required />
            <p className="donor-form__help">{enumHelp}</p>
          </div>

          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="Interest">Interés</label>
            <input id="Interest" name="Interest" className="donor-form__input" value={formData.Interest} onChange={handleChange} required />
            <p className="donor-form__help">{enumHelp}</p>
          </div>

          <div className="donor-form__field donor-form__field--full">
            <label className="donor-form__label" htmlFor="Donation_details">Detalles de donación</label>
            <textarea id="Donation_details" name="Donation_details" className="donor-form__textarea" value={formData.Donation_details} onChange={handleChange} maxLength={1000} required />
          </div>

          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="Email">Email</label>
            <input id="Email" name="Email" type="email" className="donor-form__input" value={formData.Email} onChange={handleChange} maxLength={100} required />
          </div>

          <div className="donor-form__field">
            <PhoneInputField
              label="Teléfono"
              required
              value={formData.Phone}
              onChange={(val) => {
                if (error) setError('');
                setFormData(prev => ({ ...prev, Phone: val }));
              }}
              error={
                formData.Phone && !validatePhone(formData.Phone)
                  ? 'El número de teléfono no es válido'
                  : undefined
              }
            />
          </div>
        </div>

        {error && <div className="donor-form__error">{error}</div>}

        <div className="donor-form__actions">
          <button type="button" className="donor-form__cancel-btn" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" className="donor-form__submit-btn" disabled={isLoading}>
            {isLoading ? 'Creando...' : 'Crear Donador'}
          </button>
        </div>
      </form>
    </GenericModal>
  );
};

export default AddDonorForm;

