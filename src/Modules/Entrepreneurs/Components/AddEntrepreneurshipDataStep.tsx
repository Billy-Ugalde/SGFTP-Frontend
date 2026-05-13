import { type EntrepreneurFormData } from '../Types';
import ConsentCheckbox from '../../Shared/components/ConsentCheckbox';
import '../Styles/AddEntrepreneurForm.css';
import { useState } from "react";
import { Store, CookingPot, Shirt, Palette, House, Drama, Sparkles, Heart, Landmark, Leaf, ImagePlus } from 'lucide-react';
import FormDropdown, { type FormDropdownOption } from './FormDropdown';

interface EntrepreneurshipDataStepProps {
  formValues: EntrepreneurFormData;
  onPrevious: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  renderField: (name: keyof EntrepreneurFormData, config?: any) => React.ReactNode;
  form: any;
  fieldErrors: Record<string, string>;
  onClearFieldError: (name: string) => void;
  apiError?: string;
  onCancel: () => void;
}

const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const CATEGORY_OPTIONS: FormDropdownOption[] = [
  { value: 'Comida',        label: 'Comida',         icon: <CookingPot size={16} /> },
  { value: 'Artesanía',     label: 'Artesanía',      icon: <Palette size={16} /> },
  { value: 'Vestimenta',    label: 'Vestimenta',     icon: <Shirt size={16} /> },
  { value: 'Accesorios',    label: 'Accesorios',     icon: <Sparkles size={16} /> },
  { value: 'Decoración',    label: 'Decoración',     icon: <House size={16} /> },
  { value: 'Demostración',  label: 'Demostración',   icon: <Drama size={16} /> },
  { value: 'Otra categoría',label: 'Otra categoría', icon: <Sparkles size={16} /> },
];

const APPROACH_OPTIONS: FormDropdownOption[] = [
  { value: 'social',    label: 'Social',    icon: <Heart size={16} /> },
  { value: 'cultural',  label: 'Cultural',  icon: <Landmark size={16} /> },
  { value: 'ambiental', label: 'Ambiental', icon: <Leaf size={16} /> },
];

const EntrepreneurshipDataStep = ({ onPrevious, onSubmit, isLoading, renderField, form, fieldErrors, onClearFieldError, apiError, onCancel }: EntrepreneurshipDataStepProps) => {

  const [previews, setPreviews] = useState<{ [key: string]: string | null }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: string]: string }>({});

  return (
    <div className="add-entrepreneur-form__step-content">
      <div className="add-entrepreneur-form__step-header">
        <div className="add-entrepreneur-form__step-icon">
          <Store size={24} />
        </div>
        <div>
          <h3 className="add-entrepreneur-form__step-title">Información del Emprendimiento</h3>
          <p className="add-entrepreneur-form__step-description">
            Completa los datos del emprendimiento y sube las imágenes
          </p>
        </div>
        <p className="add-entrepreneur-form__required-legend">
          <span className="add-entrepreneur-form__required">*</span> Campo obligatorio
        </p>
      </div>

      {/* Entrepreneurship Information Fields */}
      <div className="add-entrepreneur-form__fields">
        {/* Entrepreneurship Name */}
        {renderField('entrepreneurship_name', {
          label: 'Nombre del Emprendimiento',
          required: true,
          placeholder: 'Nombre de tu emprendimiento',
          maxLength: 50,
          showCharacterCount: true
        })}

        {/* Description */}
        {renderField('description', {
          label: 'Descripción',
          required: true,
          type: 'textarea',
          placeholder: 'Describe tu emprendimiento: ¿qué haces, qué productos o servicios ofreces, a quién te diriges y qué te diferencia?',
          minLength: 80,
          maxLength: 150,
          showCharacterCount: true
        })}

        {/* Location */}
        {renderField('location', {
          label: 'Ubicación',
          required: true,
          placeholder: 'Ej: San José, Costa Rica',
          maxLength: 150,
          showCharacterCount: true
        })}

        {/* Category */}
        <div data-field="category">
          <FormDropdown
            label="Categoría"
            required
            variant="add"
            value={form.state.values.category as string}
            options={CATEGORY_OPTIONS}
            onChange={(val) => {
              form.setFieldValue('category', val as any);
              onClearFieldError('category');
            }}
            error={fieldErrors.category}
          />
        </div>

        {/* Approach */}
        <div data-field="approach">
          <FormDropdown
            label="Enfoque"
            required
            variant="add"
            value={form.state.values.approach as string}
            options={APPROACH_OPTIONS}
            onChange={(val) => {
              form.setFieldValue('approach', val as any);
              onClearFieldError('approach');
            }}
            error={fieldErrors.approach}
          />
        </div>


        {/* Imágenes obligatorias */}
        <div className="add-entrepreneur-form__section">
          <h4 className="add-entrepreneur-form__section-title">Imágenes del Emprendimiento</h4>
          <p className="add-entrepreneur-form__section-description">
            Sube 3 imágenes que representen tu emprendimiento
          </p>
          <p className="add-entrepreneur-form__image-hint">
            Formatos aceptados: JPG, PNG, WebP · Tamaño máximo: 10MB por imagen
          </p>

          <div className="add-entrepreneur-form__image-uploads">
            {(['url_1', 'url_2', 'url_3'] as (keyof EntrepreneurFormData)[]).map(
              (field, idx) => {
                const previewUrl = previews[field] || null;
                return (
                  <div key={field} data-field={field} className="add-entrepreneur-form__image-upload" style={{ display: 'flex', flexDirection: 'column' }}>
                    {previewUrl ? (
                      <div className="add-entrepreneur-form__image-upload-box">
                        <div className="add-entrepreneur-form__image-preview">
                          <img src={previewUrl} alt={`Preview ${idx + 1}`} />
                          <button
                            type="button"
                            className="add-entrepreneur-form__image-remove"
                            onClick={(e) => {
                              e.preventDefault();

                              form.setFieldValue(field, undefined);

                              // limpiar preview
                              setPreviews((prev) => ({ ...prev, [field]: null }));

                              // limpiar input file asociado
                              const input = document.querySelector<HTMLInputElement>(
                                `input[name="${field}"]`
                              );
                              if (input) {
                                input.value = "";
                              }
                            }}
                          >
                            ✕
                          </button>
                        </div>
                        {/* */}
                        <input
                          type="file"
                          name={field}
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="add-entrepreneur-form__image-input"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                                setImageErrors(prev => ({ ...prev, [field]: 'Formato no permitido. Solo se aceptan: JPG, PNG, WebP.' }));
                                e.target.value = '';
                                return;
                              }
                              if (file.size > MAX_IMAGE_SIZE_BYTES) {
                                setImageErrors(prev => ({ ...prev, [field]: `La imagen no debe superar ${MAX_IMAGE_SIZE_MB}MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB.` }));
                                e.target.value = '';
                                return;
                              }
                              setImageErrors(prev => ({ ...prev, [field]: '' }));
                              onClearFieldError(field as string);
                              form.setFieldValue(field, file);
                              setPreviews((prev) => ({
                                ...prev,
                                [field]: URL.createObjectURL(file),
                              }));
                            }
                          }}
                        />
                      </div>
                    ) : (
                      // Cuando NO hay imagen, usar label para que sea clickable
                      <label className="add-entrepreneur-form__image-upload-box">
                        <div className="add-entrepreneur-form__image-upload-label">
                          <ImagePlus size={28} />
                          <span>Imagen {idx + 1}</span>
                        </div>
                        <input
                          type="file"
                          name={field}
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="add-entrepreneur-form__image-input"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                                setImageErrors(prev => ({ ...prev, [field]: 'Formato no permitido. Solo se aceptan: JPG, PNG, WebP.' }));
                                e.target.value = '';
                                return;
                              }
                              if (file.size > MAX_IMAGE_SIZE_BYTES) {
                                setImageErrors(prev => ({ ...prev, [field]: `La imagen no debe superar ${MAX_IMAGE_SIZE_MB}MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB.` }));
                                e.target.value = '';
                                return;
                              }
                              setImageErrors(prev => ({ ...prev, [field]: '' }));
                              onClearFieldError(field as string);
                              form.setFieldValue(field, file);
                              setPreviews((prev) => ({
                                ...prev,
                                [field]: URL.createObjectURL(file),
                              }));
                            }
                          }}
                        />
                      </label>
                    )}
                    {(imageErrors[field] || fieldErrors[field]) && (
                      <span className="add-entrepreneur-form__error-text">
                        {imageErrors[field] || fieldErrors[field]}
                      </span>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>



      </div>

      <div data-field="consent">
        <form.Field name="consent">
          {(field: any) => (
            <ConsentCheckbox
              checked={field.state.value || false}
              onChange={(e) => {
                const isChecked = e.target.checked;
                field.handleChange(isChecked);
                if (isChecked) onClearFieldError('consent');
              }}
              error={fieldErrors.consent || field.state.meta.errors?.[0]}
            />
          )}
        </form.Field>
      </div>

      {apiError && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          backgroundColor: '#fff5f5',
          border: '1px solid #feb2b2',
          borderRadius: '8px',
          padding: '12px 16px',
          marginTop: '8px',
        }}>
          <svg style={{ flexShrink: 0, marginTop: '2px', color: '#e53e3e' }} width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p style={{ margin: 0, color: '#c53030', fontSize: '0.9rem', lineHeight: '1.5' }}>
            {apiError}
          </p>
        </div>
      )}

      <div className="add-entrepreneur-form__step-actions">
        <button
          type="button"
          onClick={onCancel}
          className="add-entrepreneur-form__cancel-btn"
        >
          Cancelar
        </button>
        <div className="add-entrepreneur-form__navigation-buttons">
          <button
            type="button"
            onClick={onPrevious}
            className="add-entrepreneur-form__prev-btn"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior: Datos Personales
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onSubmit}
            className={`add-entrepreneur-form__submit-btn ${isLoading ? 'add-entrepreneur-form__submit-btn--loading' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="add-entrepreneur-form__loading-spinner" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando Emprendedor...
              </>
            ) : (
              <>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Terminar formulario
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurshipDataStep;