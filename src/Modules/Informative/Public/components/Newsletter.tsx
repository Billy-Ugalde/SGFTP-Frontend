import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { NewsletterSection } from '../../services/informativeService';
import subscribersService, { type CreateSubscriberRequest, type ApiError } from '../../services/NewsletterService';
import ConsentCheckbox from '../../../Shared/components/ConsentCheckbox';
import { sanitizeInput } from '../../../../shared/utils/validation.utils';
import newsletterStyles from '../styles/Newsletter.module.css';

interface Props {
  data: NewsletterSection;
}

const Newsletter: React.FC<Props> = ({ data }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    consent: '',
    submit: ''
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string, field: 'firstName' | 'lastName', lang: 'es' | 'en' = language): boolean => {
    const lettersOnly = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/;
    if (name.length < 3) {
      setErrors(prev => ({ ...prev, [field]: lang === 'es' ? 'Debe tener al menos 3 caracteres' : 'Must have at least 3 characters' }));
      return false;
    } else if (!lettersOnly.test(name)) {
      setErrors(prev => ({ ...prev, [field]: lang === 'es' ? 'Solo se permiten letras' : 'Only letters are allowed' }));
      return false;
    } else if (name.length > 50) {
      setErrors(prev => ({ ...prev, [field]: lang === 'es' ? 'No puede tener más de 50 caracteres' : 'Cannot have more than 50 characters' }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    }
  };

  const getCharacterCountClass = (length: number, max: number) => {
    if (length >= max) return newsletterStyles.nlCharCountError;
    if (length >= max - 5) return newsletterStyles.nlCharCountWarning;
    return '';
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s\-']/g, '').replace(/\n/g, '');
    setFirstName(value);
    if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
    if (submitSuccess) setSubmitSuccess(false);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s\-']/g, '').replace(/\n/g, '');
    setLastName(value);
    if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
    if (submitSuccess) setSubmitSuccess(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    if (submitSuccess) setSubmitSuccess(false);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as 'es' | 'en';
    setLanguage(newLanguage);

    if (errors.firstName) validateName(firstName, 'firstName', newLanguage);
    if (errors.lastName) validateName(lastName, 'lastName', newLanguage);
    if (errors.email) {
      const isSubscribedError = errors.email.includes('ya está') || errors.email.includes('already subscribed');
      setErrors(prev => ({
        ...prev,
        email: isSubscribedError
          ? (newLanguage === 'es' ? 'Este correo ya está suscrito' : 'This email is already subscribed')
          : !email.trim()
            ? (newLanguage === 'es' ? 'Por favor ingresa tu correo electrónico' : 'Please enter your email address')
            : (newLanguage === 'es' ? 'Por favor ingresa un correo electrónico válido' : 'Please enter a valid email address')
      }));
    }
    if (errors.consent) {
      setErrors(prev => ({
        ...prev,
        consent: newLanguage === 'es'
          ? 'Debes aceptar el Aviso de Privacidad para continuar'
          : 'You must accept the Privacy Notice to continue'
      }));
    }
    if (errors.submit) {
      const isNetworkError = errors.submit.includes('conectar') || errors.submit.includes('connect');
      setErrors(prev => ({
        ...prev,
        submit: isNetworkError
          ? (newLanguage === 'es'
              ? 'No se pudo conectar al servidor. Verifica tu conexión e intenta nuevamente.'
              : 'Could not connect to the server. Check your connection and try again.')
          : (newLanguage === 'es'
              ? 'Error al procesar la suscripción. Por favor intenta nuevamente.'
              : 'Error processing subscription. Please try again.')
      }));
    }
  };

  const handleBlur = (field: 'firstName' | 'lastName' | 'email') => {
    switch (field) {
      case 'firstName':
        if (firstName) validateName(firstName, 'firstName');
        break;
      case 'lastName':
        if (lastName) validateName(lastName, 'lastName');
        break;
      case 'email':
        if (email && !validateEmail(email)) {
          setErrors(prev => ({
            ...prev,
            email: language === 'es'
              ? 'Por favor ingresa un correo electrónico válido'
              : 'Please enter a valid email address'
          }));
        }
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({ firstName: '', lastName: '', email: '', consent: '', submit: '' });

    // Validate all fields
    const isFirstNameValid = validateName(firstName, 'firstName');
    const isLastNameValid = validateName(lastName, 'lastName');

    let isEmailValid = true;
    if (!email.trim()) {
      setErrors(prev => ({
        ...prev,
        email: language === 'es'
          ? 'Por favor ingresa tu correo electrónico'
          : 'Please enter your email address'
      }));
      isEmailValid = false;
    } else if (!validateEmail(email)) {
      setErrors(prev => ({
        ...prev,
        email: language === 'es'
          ? 'Por favor ingresa un correo electrónico válido'
          : 'Please enter a valid email address'
      }));
      isEmailValid = false;
    }

    // Validate consent
    if (!consent) {
      setErrors(prev => ({
        ...prev,
        consent: language === 'es'
          ? 'Debes aceptar el Aviso de Privacidad para continuar'
          : 'You must accept the Privacy Notice to continue'
      }));
      return;
    }

    if (!isFirstNameValid || !isLastNameValid || !isEmailValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const subscriberData: CreateSubscriberRequest = {
        email: sanitizeInput(email.trim()),
        firstName: sanitizeInput(firstName.trim()),
        lastName: sanitizeInput(lastName.trim()),
        preferredLanguage: language
      };

      await subscribersService.createSubscriber(subscriberData);

      // Success
      setSubmitSuccess(true);
      setFirstName('');
      setLastName('');
      setEmail('');
      setLanguage('es');
      setConsent(false);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.statusCode === 409) {
        setErrors(prev => ({
          ...prev,
          email: language === 'es'
            ? 'Este correo ya está suscrito'
            : 'This email is already subscribed'
        }));
      } else if (apiError.statusCode === 0) {
        setErrors(prev => ({
          ...prev,
          submit: language === 'es'
            ? 'No se pudo conectar al servidor. Verifica tu conexión e intenta nuevamente.'
            : 'Could not connect to the server. Check your connection and try again.'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          submit: language === 'es'
            ? 'Error al procesar la suscripción. Por favor intenta nuevamente.'
            : 'Error processing subscription. Please try again.'
        }));
      }

      console.error('Subscription error:', apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlaceholder = (field: string) => {
    const placeholders = {
      es: {
        firstName: 'Tu nombre',
        lastName: 'Tu apellido',
        email: 'Tu correo electrónico'
      },
      en: {
        firstName: 'Your first name',
        lastName: 'Your last name',
        email: 'Your email address'
      }
    };
    return placeholders[language][field as keyof typeof placeholders.es];
  };

  const getText = (key: string) => {
    const texts = {
      es: {
        preferredLanguage: 'Idioma preferido:',
        subscribe: 'Suscribirse',
        subscribing: 'Suscribiendo...',
        successMessage: '¡Gracias por suscribirte! Te mantendremos informado sobre nuestras actividades.',
        firstName: 'Nombre',
        lastName: 'Apellido',
        email: 'Email'
      },
      en: {
        preferredLanguage: 'Preferred language:',
        subscribe: 'Subscribe',
        subscribing: 'Subscribing...',
        successMessage: 'Thank you for subscribing! We will keep you informed about our activities.',
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email'
      }
    };
    return texts[language][key as keyof typeof texts.es];
  };

  return (
    <section className={newsletterStyles.newsletter} id="newsletter">
      <div className={newsletterStyles.nlLayout}>

        {/* Columna izquierda: kicker + título + lead */}
        <div>
          <div className={newsletterStyles.nlKicker}>13 — Mantente informado</div>
          <h2 className={newsletterStyles.nlTitle}>{data.title}</h2>
          <p className={newsletterStyles.nlLead}>{data.description}</p>
        </div>

        {/* Columna derecha: formulario */}
        <div>
          {submitSuccess && (
            <div className={newsletterStyles.newsletterSuccess}>
              <p>{getText('successMessage')}</p>
            </div>
          )}

          <form className={newsletterStyles.newsletterForm} onSubmit={handleSubmit} noValidate>
            <p className={newsletterStyles.nlRequiredLegend}>
              <span className={newsletterStyles.nlRequired}>*</span> {language === 'es' ? 'Campo obligatorio' : 'Required field'}
            </p>

            <div className={newsletterStyles.nlRow}>
              <div className={newsletterStyles.nlField}>
                <label className={newsletterStyles.nlLabel}>
                  {getText('firstName')}
                  {firstName.trim().length < 3 && <span className={newsletterStyles.nlRequired}>*</span>}
                </label>
                <textarea
                  className={`${newsletterStyles.newsletterInput} ${newsletterStyles.newsletterTextarea} ${errors.firstName ? newsletterStyles.error : ''}`}
                  placeholder={getPlaceholder('firstName')}
                  value={firstName}
                  onChange={handleFirstNameChange}
                  onBlur={() => handleBlur('firstName')}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  disabled={isSubmitting}
                  maxLength={50}
                />
                {errors.firstName && <span className={newsletterStyles.nlFieldError}>{errors.firstName}</span>}
                <div className={newsletterStyles.nlFieldInfo}>
                  <span className={newsletterStyles.nlMinLength}>{language === 'es' ? 'Mínimo: 3 caracteres' : 'Min: 3 characters'}</span>
                  <span className={`${newsletterStyles.nlCharCount} ${getCharacterCountClass(firstName.length, 50)}`}>
                    {firstName.length}/50
                  </span>
                </div>
              </div>
              <div className={newsletterStyles.nlField}>
                <label className={newsletterStyles.nlLabel}>
                  {getText('lastName')}
                  {lastName.trim().length < 3 && <span className={newsletterStyles.nlRequired}>*</span>}
                </label>
                <textarea
                  className={`${newsletterStyles.newsletterInput} ${newsletterStyles.newsletterTextarea} ${errors.lastName ? newsletterStyles.error : ''}`}
                  placeholder={getPlaceholder('lastName')}
                  value={lastName}
                  onChange={handleLastNameChange}
                  onBlur={() => handleBlur('lastName')}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  disabled={isSubmitting}
                  maxLength={50}
                />
                {errors.lastName && <span className={newsletterStyles.nlFieldError}>{errors.lastName}</span>}
                <div className={newsletterStyles.nlFieldInfo}>
                  <span className={newsletterStyles.nlMinLength}>{language === 'es' ? 'Mínimo: 3 caracteres' : 'Min: 3 characters'}</span>
                  <span className={`${newsletterStyles.nlCharCount} ${getCharacterCountClass(lastName.length, 50)}`}>
                    {lastName.length}/50
                  </span>
                </div>
              </div>
            </div>

            <div className={newsletterStyles.nlField}>
              <label className={newsletterStyles.nlLabel}>
                {getText('email')}
                {!validateEmail(email) && <span className={newsletterStyles.nlRequired}>*</span>}
              </label>
              <input
                type="email"
                className={`${newsletterStyles.newsletterInput} ${errors.email ? newsletterStyles.error : ''}`}
                placeholder={getPlaceholder('email')}
                value={email}
                onChange={handleEmailChange}
                onBlur={() => handleBlur('email')}
                disabled={isSubmitting}
                maxLength={100}
              />
              {errors.email && <span className={newsletterStyles.nlFieldError}>{errors.email}</span>}
            </div>

            <select
              id="language"
              value={language}
              onChange={handleLanguageChange}
              className={newsletterStyles.newsletterLanguageSelect}
              disabled={isSubmitting}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>

            <div>
              <ConsentCheckbox
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  if (errors.consent) setErrors(prev => ({ ...prev, consent: '' }));
                }}
                error={errors.consent}
                label={
                  language === 'es' ? (
                    <>He leído y acepto el{' '}
                      <Link to="/aviso-de-privacidad" target="_blank" rel="noopener noreferrer" className={newsletterStyles.nlConsentLink}>
                        Aviso de Privacidad
                      </Link>
                    </>
                  ) : (
                    <>I have read and accept the{' '}
                      <Link to="/aviso-de-privacidad" target="_blank" rel="noopener noreferrer" className={newsletterStyles.nlConsentLink}>
                        Privacy Notice
                      </Link>
                    </>
                  )
                }
              />
            </div>

            <button
              type="submit"
              className={newsletterStyles.newsletterBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? getText('subscribing') : getText('subscribe')}
            </button>

            <p className={newsletterStyles.nlNote}>
              {language === 'es'
                ? 'Tu información es manejada con completa confidencialidad.'
                : 'Your information is handled with complete confidentiality.'}
            </p>
          </form>

          {errors.submit && (
            <div className={newsletterStyles.newsletterErrors}>
              <p className={newsletterStyles.newsletterError}>{errors.submit}</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default Newsletter;