import React, { useMemo, useState } from 'react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import type { Donor, UpdateDonorDto } from '../Services/DonorService';
import '../Styles/DonorForm.css';
import PhoneInputField from '../../../shared/components/PhoneInput/PhoneInputField';
import { validatePhone } from '../../../shared/utils/phone.utils';

interface EditDonorFormProps {
  donor: Donor;
  onSubmit: (id: number, data: UpdateDonorDto) => Promise<void>;
  onCancel: () => void;
}

const EditDonorForm: React.FC<EditDonorFormProps> = ({ donor, onSubmit, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<UpdateDonorDto>({
    first_name: donor.first_name || '',
    second_name: donor.second_name || '',
    first_lastname: donor.first_lastname || '',
    second_lastname: donor.second_lastname || '',
    Donation_type: donor.Donation_type || '',
    Interest: donor.Interest || '',
    Donation_details: donor.Donation_details || '',
    Email: donor.Email || '',
    Phone: donor.Phone || '',
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
    if (!String(formData.first_name || '').trim() || String(formData.first_name || '').trim().length < 2) return 'Nombre es obligatorio (mínimo 2 caracteres).';
    const second = String(formData.second_name || '').trim();
    if (second && second.length < 2) return 'Segundo nombre debe tener al menos 2 caracteres (o déjalo vacío).';
    if (!String(formData.first_lastname || '').trim() || String(formData.first_lastname || '').trim().length < 2) return 'Primer apellido es obligatorio (mínimo 2 caracteres).';
    if (!String(formData.second_lastname || '').trim() || String(formData.second_lastname || '').trim().length < 2) return 'Segundo apellido es obligatorio (mínimo 2 caracteres).';
    if (!String(formData.Donation_type || '').trim()) return 'Tipo de donación es obligatorio.';
    if (!String(formData.Interest || '').trim()) return 'Interés es obligatorio.';
    if (!String(formData.Donation_details || '').trim() || String(formData.Donation_details || '').trim().length < 10) return 'Detalles de donación es obligatorio (mínimo 10 caracteres).';
    if (!String(formData.Email || '').trim()) return 'Email es obligatorio.';
    if (!String(formData.Phone || '').trim()) return 'Teléfono es obligatorio.';
    if (!validatePhone(String(formData.Phone || ''))) return 'El número de teléfono no es válido. Selecciona el código de país.';
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
      const payload: UpdateDonorDto = {
        ...formData,
        first_name: String(formData.first_name || '').trim(),
        second_name: String(formData.second_name || '').trim() ? String(formData.second_name || '').trim() : undefined,
        first_lastname: String(formData.first_lastname || '').trim(),
        second_lastname: String(formData.second_lastname || '').trim(),
        Donation_type: String(formData.Donation_type || '').trim(),
        Interest: String(formData.Interest || '').trim(),
        Donation_details: String(formData.Donation_details || '').trim(),
        Email: String(formData.Email || '').trim(),
        Phone: String(formData.Phone || '').trim(),
      };

      await onSubmit(donor.Id_donor, payload);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al actualizar el donador.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GenericModal show onClose={onCancel} title="Editar Donador" size="lg" maxHeight>
      <form onSubmit={handleSubmit}>
        <div className="donor-form__grid">
          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="first_name">Nombre</label>
            <input id="first_name" name="first_name" className="donor-form__input" value={String(formData.first_name || '')} onChange={handleChange} maxLength={50} required />
          </div>

          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="second_name">Segundo nombre (opcional)</label>
            <input id="second_name" name="second_name" className="donor-form__input" value={String(formData.second_name || '')} onChange={handleChange} maxLength={50} />
          </div>

          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="first_lastname">Primer apellido</label>
            <input id="first_lastname" name="first_lastname" className="donor-form__input" value={String(formData.first_lastname || '')} onChange={handleChange} maxLength={50} required />
          </div>

          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="second_lastname">Segundo apellido</label>
            <input id="second_lastname" name="second_lastname" className="donor-form__input" value={String(formData.second_lastname || '')} onChange={handleChange} maxLength={50} required />
          </div>

          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="Donation_type">Tipo de donación</label>
            <input id="Donation_type" name="Donation_type" className="donor-form__input" value={String(formData.Donation_type || '')} onChange={handleChange} required />
            <p className="donor-form__help">{enumHelp}</p>
          </div>

          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="Interest">Interés</label>
            <input id="Interest" name="Interest" className="donor-form__input" value={String(formData.Interest || '')} onChange={handleChange} required />
            <p className="donor-form__help">{enumHelp}</p>
          </div>

          <div className="donor-form__field donor-form__field--full">
            <label className="donor-form__label" htmlFor="Donation_details">Detalles de donación</label>
            <textarea id="Donation_details" name="Donation_details" className="donor-form__textarea" value={String(formData.Donation_details || '')} onChange={handleChange} maxLength={1000} required />
          </div>

          <div className="donor-form__field">
            <label className="donor-form__label" htmlFor="Email">Email</label>
            <input id="Email" name="Email" type="email" className="donor-form__input" value={String(formData.Email || '')} onChange={handleChange} maxLength={100} required />
          </div>

          <div className="donor-form__field">
            <PhoneInputField
              label="Teléfono"
              required
              value={String(formData.Phone || '')}
              onChange={(val) => {
                if (error) setError('');
                setFormData(prev => ({ ...prev, Phone: val }));
              }}
              error={
                formData.Phone && !validatePhone(String(formData.Phone))
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
            {isLoading ? 'Actualizando...' : 'Actualizar Donador'}
          </button>
        </div>
      </form>
    </GenericModal>
  );
};

export default EditDonorForm;

