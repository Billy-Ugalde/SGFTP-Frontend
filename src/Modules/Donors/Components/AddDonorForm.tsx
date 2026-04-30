import React, { useState, useMemo } from 'react';
import { Heart, Landmark, Leaf, Utensils, Shirt, DollarSign, Package, Tag, Search, UserCheck, UserPlus } from 'lucide-react';
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import FormDropdown, { type FormDropdownOption } from '../../Entrepreneurs/Components/FormDropdown';
import ConsentCheckbox from '../../Shared/components/ConsentCheckbox';
import type { CreateDonationDto, Donor } from '../Services/DonorService';
import {
  DonationType,
  DonorInterest,
  DonorType,
  DonorTypeLabels,
  getDonorFullName,
  useDonations,
} from '../Services/DonorService';
import '../../Entrepreneurs/Styles/FormDropdown.css';
import '../Styles/DonorForm.css';
import PhoneInputField from '../../../shared/components/PhoneInput/PhoneInputField';
import { validatePhone } from '../../../shared/utils/phone.utils';

const INTEREST_OPTIONS: FormDropdownOption[] = [
  { value: DonorInterest.SOCIAL,        label: 'Social',    icon: <Heart size={16} /> },
  { value: DonorInterest.CULTURAL,      label: 'Cultural',  icon: <Landmark size={16} /> },
  { value: DonorInterest.ENVIRONMENTAL, label: 'Ambiental', icon: <Leaf size={16} /> },
];

const DONATION_TYPE_OPTIONS: FormDropdownOption[] = [
  { value: DonationType.FOOD,       label: 'Comida',           icon: <Utensils size={16} /> },
  { value: DonationType.CLOTHING,   label: 'Ropa',             icon: <Shirt size={16} /> },
  { value: DonationType.MONEY,      label: 'Dinero',           icon: <DollarSign size={16} /> },
  { value: DonationType.USED_ITEMS, label: 'Artículos usados', icon: <Package size={16} /> },
  { value: DonationType.OTHER,      label: 'Otro',             icon: <Tag size={16} /> },
];

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

  // ── Modo: donador existente o nuevo ──
  const [donorMode, setDonorMode] = useState<'existing' | 'new'>('existing');

  // ── Selección de donador existente ──
  const { data: donations = [] } = useDonations();
  const [donorSearch, setDonorSearch] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [donorPage, setDonorPage] = useState(1);
  const DONORS_PER_PAGE = 3;

  const uniqueDonors = useMemo<Donor[]>(() => {
    const seen = new Map<number, Donor>();
    donations.forEach((d) => {
      if (!seen.has(d.donor.idDonor)) seen.set(d.donor.idDonor, d.donor);
    });
    return Array.from(seen.values()).sort((a, b) =>
      getDonorFullName(a).localeCompare(getDonorFullName(b))
    );
  }, [donations]);

  const filteredDonors = useMemo(() => {
    const term = donorSearch.trim().toLowerCase();
    if (!term) return uniqueDonors;
    return uniqueDonors.filter(
      (d) =>
        getDonorFullName(d).toLowerCase().includes(term) ||
        d.email.toLowerCase().includes(term)
    );
  }, [uniqueDonors, donorSearch]);

  const donorTotalPages = Math.ceil(filteredDonors.length / DONORS_PER_PAGE);
  const donorStartIdx = (donorPage - 1) * DONORS_PER_PAGE;
  const pagedDonors = filteredDonors.slice(donorStartIdx, donorStartIdx + DONORS_PER_PAGE);

  // ── Nuevo donador ──
  const [donorType, setDonorType] = useState<DonorType>(DonorType.DONOR);
  const [nameCompany, setNameCompany] = useState('');
  const [newDonorData, setNewDonorData] = useState({
    firstName: '',
    secondName: '',
    firstLastName: '',
    secondLastName: '',
    email: '',
    phone: '',
    interest: '' as DonorInterest,
  });

  // ── Datos de la donación (comunes a ambos modos) ──
  const [donationType, setDonationType] = useState<DonationType>('' as DonationType);
  const [donationDetails, setDonationDetails] = useState('');

  const handleNewDonorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setNewDonorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDonorTypeChange = (type: DonorType) => {
    if (fieldErrors.nameCompany) setFieldErrors((prev) => ({ ...prev, nameCompany: '' }));
    setDonorType(type);
    setNameCompany('');
  };

  const handleModeChange = (mode: 'existing' | 'new') => {
    setDonorMode(mode);
    setFieldErrors({});
    setApiError('');
    setSelectedDonor(null);
    setDonorSearch('');
    setDonorPage(1);
  };

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (donorMode === 'existing') {
      if (!selectedDonor) errors.selectedDonor = 'Debes seleccionar un donador existente.';
    } else {
      if (!newDonorData.firstName.trim() || newDonorData.firstName.trim().length < 2)
        errors.firstName = 'El nombre es obligatorio (mínimo 2 caracteres).';
      if (newDonorData.secondName && newDonorData.secondName.trim().length > 0 && newDonorData.secondName.trim().length < 2)
        errors.secondName = 'El segundo nombre debe tener al menos 2 caracteres (o déjalo vacío).';
      if (!newDonorData.firstLastName.trim() || newDonorData.firstLastName.trim().length < 2)
        errors.firstLastName = 'El primer apellido es obligatorio (mínimo 2 caracteres).';
      if (!newDonorData.secondLastName.trim() || newDonorData.secondLastName.trim().length < 2)
        errors.secondLastName = 'El segundo apellido es obligatorio (mínimo 2 caracteres).';
      if (donorType === DonorType.STRATEGIC_ALLY && (!nameCompany.trim() || nameCompany.trim().length < 2))
        errors.nameCompany = 'El nombre de empresa es obligatorio (mínimo 2 caracteres).';
      if (!newDonorData.interest) errors.interest = 'El área de interés es obligatoria.';
      if (!newDonorData.email.trim())
        errors.email = 'El email es obligatorio.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newDonorData.email.trim()))
        errors.email = 'El email no tiene un formato válido.';
      if (!newDonorData.phone || !validatePhone(newDonorData.phone))
        errors.phone = 'El teléfono es obligatorio y debe incluir código de país (ej: +50688888888).';
      if (!consent) errors.consent = 'Debes aceptar el Aviso de Privacidad para continuar.';
    }

    if (!donationType) errors.donationType = 'El tipo de donación es obligatorio.';
    if (!donationDetails.trim() || donationDetails.trim().length < 10)
      errors.donationDetails = 'Los detalles de donación son obligatorios (mínimo 10 caracteres).';

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
      let payload: CreateDonationDto;

      if (donorMode === 'existing' && selectedDonor) {
        payload = {
          firstName: selectedDonor.firstName,
          ...(selectedDonor.secondName ? { secondName: selectedDonor.secondName } : {}),
          firstLastName: selectedDonor.firstLastName,
          secondLastName: selectedDonor.secondLastName,
          donorType: selectedDonor.donorType,
          ...(selectedDonor.nameCompany ? { nameCompany: selectedDonor.nameCompany } : {}),
          interest: selectedDonor.interest,
          email: selectedDonor.email,
          phone: selectedDonor.phone,
          donationType,
          donationDetails: donationDetails.trim(),
        };
      } else {
        payload = {
          firstName: newDonorData.firstName.trim(),
          ...(newDonorData.secondName?.trim() ? { secondName: newDonorData.secondName.trim() } : {}),
          firstLastName: newDonorData.firstLastName.trim(),
          secondLastName: newDonorData.secondLastName.trim(),
          interest: newDonorData.interest,
          email: newDonorData.email.trim(),
          phone: newDonorData.phone.trim(),
          donationType,
          donationDetails: donationDetails.trim(),
          donorType,
          ...(donorType === DonorType.STRATEGIC_ALLY && nameCompany.trim() ? { nameCompany: nameCompany.trim() } : {}),
        };
      }

      await onSubmit(payload);
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message;
      const msg = Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg;
      setApiError(msg || 'Error al crear la donación.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GenericModal show onClose={onCancel} title="Agregar Donación" size="lg" maxHeight>
      <form onSubmit={handleSubmit} noValidate>

        {/* ── Selector de modo ── */}
        <div className="donor-form__section">
          <h3 className="donor-form__section-title">¿A quién va la donación?</h3>
          <p className="donor-form__required-legend"><span className="donor-form__required">*</span> Campo obligatorio</p>
          <div className="donor-form__type-buttons">
            <button
              type="button"
              className={`donor-form__type-btn ${donorMode === 'existing' ? 'donor-form__type-btn--active' : ''}`}
              onClick={() => handleModeChange('existing')}
            >
              <UserCheck size={16} style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
              Donador existente
            </button>
            <button
              type="button"
              className={`donor-form__type-btn ${donorMode === 'new' ? 'donor-form__type-btn--active' : ''}`}
              onClick={() => handleModeChange('new')}
            >
              <UserPlus size={16} style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
              Nuevo donador
            </button>
          </div>
        </div>

        {/* ── Donador existente ── */}
        {donorMode === 'existing' && (
          <div className="donor-form__section">
            <h3 className="donor-form__section-title">Seleccionar donador</h3>

            {/* Buscador */}
            <div className="donor-form__donor-search">
              <div className="donor-form__search-icon"><Search size={16} /></div>
              <input
                type="text"
                className="donor-form__input donor-form__input--search"
                placeholder="Buscar por nombre o email..."
                value={donorSearch}
                onChange={(e) => { setDonorSearch(e.target.value); setDonorPage(1); if (selectedDonor) setSelectedDonor(null); if (fieldErrors.selectedDonor) setFieldErrors(prev => ({ ...prev, selectedDonor: '' })); }}
              />
            </div>

            {/* Lista de donadores */}
            <div className="donor-form__donor-list">
              {filteredDonors.length === 0 ? (
                <p className="donor-form__donor-empty">
                  {donorSearch ? 'No se encontraron donadores con ese criterio.' : 'No hay donadores registrados.'}
                </p>
              ) : (
                pagedDonors.map((d) => (
                  <button
                    key={d.idDonor}
                    type="button"
                    className={`donor-form__donor-item ${selectedDonor?.idDonor === d.idDonor ? 'donor-form__donor-item--selected' : ''}`}
                    onClick={() => { setSelectedDonor(d); if (fieldErrors.selectedDonor) setFieldErrors(prev => ({ ...prev, selectedDonor: '' })); }}
                  >
                    <div className="donor-form__donor-item-info">
                      <span className="donor-form__donor-item-name">{getDonorFullName(d)}</span>
                      <span className="donor-form__donor-item-email">{d.email}</span>
                    </div>
                    {selectedDonor?.idDonor === d.idDonor && (
                      <div className="donor-form__donor-item-check">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Paginación de la lista */}
            {donorTotalPages > 1 && (
              <div className="donor-form__donor-pagination">
                <button
                  type="button"
                  className="donor-form__donor-page-btn"
                  onClick={() => setDonorPage((p) => Math.max(1, p - 1))}
                  disabled={donorPage === 1}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="donor-form__donor-page-numbers">
                  {Array.from({ length: donorTotalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`donor-form__donor-page-number ${donorPage === page ? 'donor-form__donor-page-number--active' : ''}`}
                      onClick={() => setDonorPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="donor-form__donor-page-btn"
                  onClick={() => setDonorPage((p) => Math.min(donorTotalPages, p + 1))}
                  disabled={donorPage === donorTotalPages}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <span className="donor-form__donor-page-info">
                  {donorStartIdx + 1}–{Math.min(donorStartIdx + DONORS_PER_PAGE, filteredDonors.length)} de {filteredDonors.length}
                </span>
              </div>
            )}

            {fieldErrors.selectedDonor && <span className="donor-form__error-text">{fieldErrors.selectedDonor}</span>}

            {/* Resumen del donador seleccionado */}
            {selectedDonor && (
              <div className="donor-form__selected-summary">
                <div className="donor-form__selected-row">
                  <span className="donor-form__selected-label">Nombre:</span>
                  <span className="donor-form__selected-value">{getDonorFullName(selectedDonor)}</span>
                </div>
                <div className="donor-form__selected-row">
                  <span className="donor-form__selected-label">Email:</span>
                  <span className="donor-form__selected-value">{selectedDonor.email}</span>
                </div>
                <div className="donor-form__selected-row">
                  <span className="donor-form__selected-label">Interés:</span>
                  <span className="donor-form__selected-value">{selectedDonor.interest}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Nuevo donador ── */}
        {donorMode === 'new' && (
          <>
            {/* Tipo de Donador */}
            <div className="donor-form__section">
              <h3 className="donor-form__section-title">Tipo de Donador</h3>
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
                    {nameCompany.trim().length < 2 && <span className="donor-form__required">*</span>}
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

            {/* Datos del Donador */}
            <div className="donor-form__section">
              <h3 className="donor-form__section-title">Datos del Donador</h3>
              <div className="donor-form__grid">

                <div className="donor-form__field">
                  <label className="donor-form__label" htmlFor="firstName">
                    Nombre
                    {newDonorData.firstName.trim().length < 2 && <span className="donor-form__required">*</span>}
                  </label>
                  <input id="firstName" name="firstName" className="donor-form__input" value={newDonorData.firstName} onChange={handleNewDonorChange} maxLength={50} />
                  {fieldErrors.firstName && <span className="donor-form__error-text">{fieldErrors.firstName}</span>}
                  <div className="donor-form__field-info">
                    <div className="donor-form__min-length">Mínimo: 2 caracteres</div>
                    <div className={`donor-form__character-count ${getCharacterCountClass(newDonorData.firstName.length, 50)}`}>
                      {newDonorData.firstName.length}/50 caracteres
                    </div>
                  </div>
                </div>

                <div className="donor-form__field">
                  <label className="donor-form__label" htmlFor="secondName">
                    Segundo nombre{' '}
                    {!newDonorData.secondName?.trim() && <span className="donor-form__optional">(opcional)</span>}
                  </label>
                  <input id="secondName" name="secondName" className="donor-form__input" value={newDonorData.secondName || ''} onChange={handleNewDonorChange} maxLength={50} />
                  {fieldErrors.secondName && <span className="donor-form__error-text">{fieldErrors.secondName}</span>}
                </div>

                <div className="donor-form__field">
                  <label className="donor-form__label" htmlFor="firstLastName">
                    Primer apellido
                    {newDonorData.firstLastName.trim().length < 2 && <span className="donor-form__required">*</span>}
                  </label>
                  <input id="firstLastName" name="firstLastName" className="donor-form__input" value={newDonorData.firstLastName} onChange={handleNewDonorChange} maxLength={50} />
                  {fieldErrors.firstLastName && <span className="donor-form__error-text">{fieldErrors.firstLastName}</span>}
                  <div className="donor-form__field-info">
                    <div className="donor-form__min-length">Mínimo: 2 caracteres</div>
                    <div className={`donor-form__character-count ${getCharacterCountClass(newDonorData.firstLastName.length, 50)}`}>
                      {newDonorData.firstLastName.length}/50 caracteres
                    </div>
                  </div>
                </div>

                <div className="donor-form__field">
                  <label className="donor-form__label" htmlFor="secondLastName">
                    Segundo apellido
                    {newDonorData.secondLastName.trim().length < 2 && <span className="donor-form__required">*</span>}
                  </label>
                  <input id="secondLastName" name="secondLastName" className="donor-form__input" value={newDonorData.secondLastName} onChange={handleNewDonorChange} maxLength={50} />
                  {fieldErrors.secondLastName && <span className="donor-form__error-text">{fieldErrors.secondLastName}</span>}
                  <div className="donor-form__field-info">
                    <div className="donor-form__min-length">Mínimo: 2 caracteres</div>
                    <div className={`donor-form__character-count ${getCharacterCountClass(newDonorData.secondLastName.length, 50)}`}>
                      {newDonorData.secondLastName.length}/50 caracteres
                    </div>
                  </div>
                </div>

                <div className="donor-form__field">
                  <label className="donor-form__label" htmlFor="email">
                    Email
                    {!newDonorData.email.trim() && <span className="donor-form__required">*</span>}
                  </label>
                  <input id="email" name="email" type="email" className="donor-form__input" value={newDonorData.email} onChange={handleNewDonorChange} maxLength={100} />
                  {fieldErrors.email && <span className="donor-form__error-text">{fieldErrors.email}</span>}
                  <div className="donor-form__field-info">
                    <div className="donor-form__min-length" />
                    <div className={`donor-form__character-count ${getCharacterCountClass(newDonorData.email.length, 100)}`}>
                      {newDonorData.email.length}/100 caracteres
                    </div>
                  </div>
                </div>

                <div className="donor-form__field">
                  <PhoneInputField
                    label="Teléfono"
                    required
                    value={newDonorData.phone}
                    onChange={(val) => { setNewDonorData((prev) => ({ ...prev, phone: val })); if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' })); }}
                    error={fieldErrors.phone || (newDonorData.phone && !validatePhone(newDonorData.phone) ? 'Número inválido. Incluye código de país (ej: +50688888888)' : undefined)}
                    variant="add"
                  />
                </div>

                <div className="donor-form__field donor-form__field--full">
                  <FormDropdown
                    label="Área de interés"
                    value={newDonorData.interest}
                    onChange={(val) => { setNewDonorData(prev => ({ ...prev, interest: val as DonorInterest })); if (fieldErrors.interest) setFieldErrors(prev => ({ ...prev, interest: '' })); }}
                    options={INTEREST_OPTIONS}
                    required
                    error={fieldErrors.interest}
                    variant="add"
                  />
                </div>

              </div>
            </div>

            <ConsentCheckbox
              checked={consent}
              onChange={(e) => { setConsent(e.target.checked); if (fieldErrors.consent) setFieldErrors(prev => ({ ...prev, consent: '' })); }}
              error={fieldErrors.consent}
            />
          </>
        )}

        {/* ── Datos de la Donación (siempre visibles) ── */}
        <div className="donor-form__section">
          <h3 className="donor-form__section-title">Datos de la Donación</h3>
          <div className="donor-form__grid">

            <div className="donor-form__field donor-form__field--full">
              <FormDropdown
                label="Tipo de donación"
                value={donationType}
                onChange={(val) => { setDonationType(val as DonationType); if (fieldErrors.donationType) setFieldErrors(prev => ({ ...prev, donationType: '' })); }}
                options={DONATION_TYPE_OPTIONS}
                required
                error={fieldErrors.donationType}
                variant="add"
              />
            </div>

            <div className="donor-form__field donor-form__field--full">
              <label className="donor-form__label" htmlFor="donationDetails">
                Detalles de donación
                {donationDetails.trim().length < 10 && <span className="donor-form__required">*</span>}
              </label>
              <textarea
                id="donationDetails"
                className="donor-form__textarea"
                value={donationDetails}
                onChange={(e) => { setDonationDetails(e.target.value); if (fieldErrors.donationDetails) setFieldErrors(prev => ({ ...prev, donationDetails: '' })); }}
                maxLength={1000}
              />
              {fieldErrors.donationDetails && <span className="donor-form__error-text">{fieldErrors.donationDetails}</span>}
              <div className="donor-form__field-info">
                <div className="donor-form__min-length">Mínimo: 10 caracteres</div>
                <div className={`donor-form__character-count ${getCharacterCountClass(donationDetails.length, 1000)}`}>
                  {donationDetails.length}/1000 caracteres
                </div>
              </div>
            </div>

          </div>
        </div>

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
