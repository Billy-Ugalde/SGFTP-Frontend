import React, { useState } from 'react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import ConsentCheckbox from '../../Shared/components/ConsentCheckbox';
import type { CreateDonationDto } from '../Services/DonorService';
import {
  DonationType,
  DonorInterest,
  DonorType,
  DonationTypeLabels,
  DonorInterestLabels,
  DonorTypeLabels,
} from '../Services/DonorService';
import '../Styles/DonorForm.css';
import PhoneInputField from '../../../shared/components/PhoneInput/PhoneInputField';
import { validatePhone } from '../../../shared/utils/phone.utils';

interface AddDonorFormProps {
  onSubmit: (data: CreateDonationDto) => Promise<void>;
  onCancel: () => void;
}

const getCharacterCountClass = (currentLength: number, maxLength: number) => {
  if (currentLength >= maxLength) return 'donor-form__character-count--error';
  if (currentLength >= maxLength - 10) return 'donor-form__character-count--warning';
  return '';
};

const AddDonorForm: React.FC<AddDonorFormProps> = ({ onSubmit, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [consent, setConsent] = useState(false);

  const [donorType, setDonorType] = useState<DonorType>(DonorType.DONOR);
  const [nameCompany, setNameCompany] = useState('');

  const [formData, setFormData] = useState<CreateDonationDto>({
    firstName: '',
    secondName: '',
    firstLastName: '',
    secondLastName: '',
    donationType: '' as DonationType,
    interest: '' as DonorInterest,
    donationDetails: '',
    email: '',
    phone: '',
    donorType: DonorType.DONOR,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDonorTypeChange = (type: DonorType) => {
    if (fieldErrors.nameCompany) setFieldErrors(prev => ({ ...prev, nameCompany: '' }));
    setDonorType(type);
    setNameCompany('');
  };

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2)
      errors.firstName = 'El nombre es obligatorio (mínimo 2 caracteres).';
    if (formData.secondName && formData.secondName.trim().length > 0 && formData.secondName.trim().length < 2)
      errors.secondName = 'El segundo nombre debe tener al menos 2 caracteres (o déjalo vacío).';
    if (!formData.firstLastName.trim() || formData.firstLastName.trim().length < 2)
      errors.firstLastName = 'El primer apellido es obligatorio (mínimo 2 caracteres).';
    if (!formData.secondLastName.trim() || formData.secondLastName.trim().length < 2)
      errors.secondLastName = 'El segundo apellido es obligatorio (mínimo 2 caracteres).';
    if (donorType === DonorType.STRATEGIC_ALLY && (!nameCompany.trim() || nameCompany.trim().length < 2))
      errors.nameCompany = 'El nombre de empresa es obligatorio para aliados estratégicos (mínimo 2 caracteres).';
    if (!formData.donationType)
      errors.donationType = 'El tipo de donación es obligatorio.';
    if (!formData.interest)
      errors.interest = 'El interés es obligatorio.';
    if (!formData.donationDetails.trim() || formData.donationDetails.trim().length < 10)
      errors.donationDetails = 'Los detalles de donación son obligatorios (mínimo 10 caracteres).';
    if (!formData.email.trim())
      errors.email = 'El email es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      errors.email = 'El email no tiene un formato válido.';
    if (!formData.phone || !validatePhone(formData.phone))
      errors.phone = 'El teléfono es obligatorio y debe incluir código de país (ej: +50688888888).';
    if (!consent)
      errors.consent = 'Debes aceptar el Aviso de Privacidad para continuar.';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setApiError('');
    setIsLoading(true);
    try {
      const payload: CreateDonationDto = {
        firstName: formData.firstName.trim(),
        ...(formData.secondName?.trim() ? { secondName: formData.secondName.trim() } : {}),
        firstLastName: formData.firstLastName.trim(),
        secondLastName: formData.secondLastName.trim(),
        interest: formData.interest,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        donationType: formData.donationType,
        donationDetails: formData.donationDetails.trim(),
        donorType: donorType,
        ...(donorType === DonorType.STRATEGIC_ALLY && nameCompany.trim() ? { nameCompany: nameCompany.trim() } : {}),
      };
      await onSubmit(payload);
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message;
      const msg = Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg;
      setApiError(msg || 'Error al crear el donador.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GenericModal show onClose={onCancel} title="Agregar Donación" size="lg" maxHeight>
      <form onSubmit={handleSubmit} noValidate>

        {/* ── Tipo de Donador ── */}
        <div className="donor-form__section">
          <h3 className="donor-form__section-title">Tipo de Donador</h3>
          <p className="donor-form__required-legend"><span className="donor-form__required">*</span> Campo obligatorio</p>
          <div className="donor-form__type-buttons">
            {Object.entries(DonorTypeLabels).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`donor-form__type-btn ${donorType === value ? 'donor-form__type-btn--active' : ''}`}
                onClick={() => handleDonorTypeChange(value as DonorType)}
              >
                {label}
              </button>
            ))}
          </div>

          {donorType === DonorType.STRATEGIC_ALLY && (
            <div className="donor-form__field donor-form__field--full" style={{ marginTop: '1rem' }}>
              <label className="donor-form__label" htmlFor="name_company">
                Nombre de la empresa{' '}
                {nameCompany.trim().length < 2 && (
                  <span className="donor-form__required">*</span>
                )}
              </label>
              <input
                id="name_company"
                name="name_company"
                className="donor-form__input"
                value={nameCompany}
                onChange={(e) => { setNameCompany(e.target.value); if (fieldErrors.nameCompany) setFieldErrors(prev => ({ ...prev, nameCompany: '' })); }}
                maxLength={100}
              />
              {fieldErrors.nameCompany && <span className="donor-form__error-text">{fieldErrors.nameCompany}</span>}
              <div className="donor-form__field-info">
                <div className="donor-form__min-length">Mínimo: 2 caracteres</div>
                <div className={`donor-form__character-count ${getCharacterCountClass(nameCompany.length, 100)}`}>
                  {nameCompany.length}/100 caracteres
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Datos del Donador ── */}
        <div className="donor-form__section">
          <h3 className="donor-form__section-title">Datos del Donador</h3>
          <div className="donor-form__grid">

            <div className="donor-form__field">
              <label className="donor-form__label" htmlFor="firstName">
                Nombre
                {formData.firstName.trim().length < 2 && (
                  <span className="donor-form__required">*</span>
                )}
              </label>
              <input id="firstName" name="firstName" className="donor-form__input" value={formData.firstName} onChange={handleChange} maxLength={50} />
              {fieldErrors.firstName && <span className="donor-form__error-text">{fieldErrors.firstName}</span>}
              <div className="donor-form__field-info">
                <div className="donor-form__min-length">Mínimo: 2 caracteres</div>
                <div className={`donor-form__character-count ${getCharacterCountClass(formData.firstName.length, 50)}`}>
                  {formData.firstName.length}/50 caracteres
                </div>
              </div>
            </div>

            <div className="donor-form__field">
              <label className="donor-form__label" htmlFor="secondName">
                Segundo nombre{' '}
                {!formData.secondName?.trim() && <span className="donor-form__optional">(opcional)</span>}
              </label>
              <input id="secondName" name="secondName" className="donor-form__input" value={formData.secondName || ''} onChange={handleChange} maxLength={50} />
              {fieldErrors.secondName && <span className="donor-form__error-text">{fieldErrors.secondName}</span>}
              <div className="donor-form__field-info">
                <div className="donor-form__min-length">Mínimo: 2 caracteres</div>
                <div className={`donor-form__character-count ${getCharacterCountClass((formData.secondName || '').length, 50)}`}>
                  {(formData.secondName || '').length}/50 caracteres
                </div>
              </div>
            </div>

            <div className="donor-form__field">
              <label className="donor-form__label" htmlFor="firstLastName">
                Primer apellido
                {formData.firstLastName.trim().length < 2 && (
                  <span className="donor-form__required">*</span>
                )}
              </label>
              <input id="firstLastName" name="firstLastName" className="donor-form__input" value={formData.firstLastName} onChange={handleChange} maxLength={50} />
              {fieldErrors.firstLastName && <span className="donor-form__error-text">{fieldErrors.firstLastName}</span>}
              <div className="donor-form__field-info">
                <div className="donor-form__min-length">Mínimo: 2 caracteres</div>
                <div className={`donor-form__character-count ${getCharacterCountClass(formData.firstLastName.length, 50)}`}>
                  {formData.firstLastName.length}/50 caracteres
                </div>
              </div>
            </div>

            <div className="donor-form__field">
              <label className="donor-form__label" htmlFor="secondLastName">
                Segundo apellido
                {formData.secondLastName.trim().length < 2 && (
                  <span className="donor-form__required">*</span>
                )}
              </label>
              <input id="secondLastName" name="secondLastName" className="donor-form__input" value={formData.secondLastName} onChange={handleChange} maxLength={50} />
              {fieldErrors.secondLastName && <span className="donor-form__error-text">{fieldErrors.secondLastName}</span>}
              <div className="donor-form__field-info">
                <div className="donor-form__min-length">Mínimo: 2 caracteres</div>
                <div className={`donor-form__character-count ${getCharacterCountClass(formData.secondLastName.length, 50)}`}>
                  {formData.secondLastName.length}/50 caracteres
                </div>
              </div>
            </div>

            <div className="donor-form__field">
              <label className="donor-form__label" htmlFor="email">
                Email
                {!formData.email.trim() && (
                  <span className="donor-form__required">*</span>
                )}
              </label>
              <input id="email" name="email" type="email" className="donor-form__input" value={formData.email} onChange={handleChange} maxLength={100} />
              {fieldErrors.email && <span className="donor-form__error-text">{fieldErrors.email}</span>}
              <div className="donor-form__field-info">
                <div className="donor-form__min-length" />
                <div className={`donor-form__character-count ${getCharacterCountClass(formData.email.length, 100)}`}>
                  {formData.email.length}/100 caracteres
                </div>
              </div>
            </div>

            <div className="donor-form__field">
              <PhoneInputField
                label="Teléfono"
                required
                value={formData.phone}
                onChange={(val) => { setFormData((prev) => ({ ...prev, phone: val })); if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' })); }}
                error={fieldErrors.phone || (formData.phone && !validatePhone(formData.phone) ? 'El número de teléfono no es válido. Debe incluir código de país (ej: +50688888888)' : undefined)}
              />
            </div>

            <div className="donor-form__field">
              <label className="donor-form__label" htmlFor="interest">
                Interés
                {!formData.interest && (
                  <span className="donor-form__required">*</span>
                )}
              </label>
              <select id="interest" name="interest" className="donor-form__input" value={formData.interest} onChange={handleChange}>
                <option value="" disabled>Selecciona una opción</option>
                {Object.entries(DonorInterestLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {fieldErrors.interest && <span className="donor-form__error-text">{fieldErrors.interest}</span>}
            </div>

          </div>
        </div>

        {/* ── Datos de la Donación ── */}
        <div className="donor-form__section">
          <h3 className="donor-form__section-title">Datos de la Donación</h3>
          <div className="donor-form__grid">

            <div className="donor-form__field">
              <label className="donor-form__label" htmlFor="donationType">
                Tipo de donación
                {!formData.donationType && (
                  <span className="donor-form__required">*</span>
                )}
              </label>
              <select id="donationType" name="donationType" className="donor-form__input" value={formData.donationType} onChange={handleChange}>
                <option value="" disabled>Selecciona una opción</option>
                {Object.entries(DonationTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {fieldErrors.donationType && <span className="donor-form__error-text">{fieldErrors.donationType}</span>}
            </div>

            <div className="donor-form__field donor-form__field--full">
              <label className="donor-form__label" htmlFor="donationDetails">
                Detalles de donación
                {formData.donationDetails.trim().length < 10 && (
                  <span className="donor-form__required">*</span>
                )}
              </label>
              <textarea id="donationDetails" name="donationDetails" className="donor-form__textarea" value={formData.donationDetails} onChange={handleChange} maxLength={1000} />
              {fieldErrors.donationDetails && <span className="donor-form__error-text">{fieldErrors.donationDetails}</span>}
              <div className="donor-form__field-info">
                <div className="donor-form__min-length">Mínimo: 10 caracteres</div>
                <div className={`donor-form__character-count ${getCharacterCountClass(formData.donationDetails.length, 1000)}`}>
                  {formData.donationDetails.length}/1000 caracteres
                </div>
              </div>
            </div>

          </div>
        </div>

        <ConsentCheckbox checked={consent} onChange={(e) => { setConsent(e.target.checked); if (fieldErrors.consent) setFieldErrors(prev => ({ ...prev, consent: '' })); }} error={fieldErrors.consent} />

        {apiError && <p className="donor-form__error-text">{apiError}</p>}

        <div className="donor-form__actions">
          <button type="button" className="donor-form__cancel-btn" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" className="donor-form__submit-btn" disabled={isLoading}>
            {isLoading ? 'Creando...' : 'Crear Donación'}
          </button>
        </div>
      </form>
    </GenericModal>
  );
};

export default AddDonorForm;
