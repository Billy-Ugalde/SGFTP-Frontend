import React, { useState } from 'react';
import type { NewsletterSection } from '../../services/informativeService';
import subscribersService, { type CreateSubscriberRequest, type ApiError } from '../../services/NewsletterService';
import ConsentCheckbox from '../../../Shared/components/ConsentCheckbox';
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

  const validateName = (name: string, field: 'firstName' | 'lastName'): boolean => {
    if (name.length < 2) {
      setErrors(prev => ({ ...prev, [field]: language === 'es' ? 'Debe tener al menos 2 caracteres' : 'Must have at least 2 characters' }));
      return false;
    } else if (name.length > 50) {
      setErrors(prev => ({ ...prev, [field]: language === 'es' ? 'No puede tener más de 50 caracteres' : 'Cannot have more than 50 characters' }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    }
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFirstName(value);
    if (errors.firstName) {
      validateName(value, 'firstName');
    }
    // Clear submit success when user starts typing again
    if (submitSuccess) setSubmitSuccess(false);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLastName(value);
    if (errors.lastName) {
      validateName(value, 'lastName');
    }
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

    // Re-validate with new language if there are current errors
    if (errors.firstName) validateName(firstName, 'firstName');
    if (errors.lastName) validateName(lastName, 'lastName');
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
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
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

      // Handle specific error cases
      if (apiError.statusCode === 409) {
        setErrors(prev => ({
          ...prev,
          email: language === 'es'
            ? 'Este correo ya está suscrito'
            : 'This email is already subscribed'
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
          <div className={newsletterStyles.nlKicker}>11 — Mantente informado</div>
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

          <form className={newsletterStyles.newsletterForm} onSubmit={handleSubmit}>
            <div className={newsletterStyles.nlRow}>
              <input
                type="text"
                className={`${newsletterStyles.newsletterInput} ${errors.firstName ? newsletterStyles.error : ''}`}
                placeholder={getPlaceholder('firstName')}
                value={firstName}
                onChange={handleFirstNameChange}
                onBlur={() => handleBlur('firstName')}
                disabled={isSubmitting}
                required
              />
              <input
                type="text"
                className={`${newsletterStyles.newsletterInput} ${errors.lastName ? newsletterStyles.error : ''}`}
                placeholder={getPlaceholder('lastName')}
                value={lastName}
                onChange={handleLastNameChange}
                onBlur={() => handleBlur('lastName')}
                disabled={isSubmitting}
                required
              />
            </div>

            <input
              type="email"
              className={`${newsletterStyles.newsletterInput} ${errors.email ? newsletterStyles.error : ''}`}
              placeholder={getPlaceholder('email')}
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur('email')}
              disabled={isSubmitting}
              required
              maxLength={50}
            />

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
                onChange={(e) => setConsent(e.target.checked)}
                error={errors.consent}
              />
            </div>

            <button
              type="submit"
              className={newsletterStyles.newsletterBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? getText('subscribing') : getText('subscribe')}
            </button>

            <p className={newsletterStyles.nlNote}>{data.disclaimer}</p>
          </form>

          {(errors.firstName || errors.lastName || errors.email || errors.submit) && (
            <div className={newsletterStyles.newsletterErrors}>
              {errors.firstName && <p className={newsletterStyles.newsletterError}>{getText('firstName')}: {errors.firstName}</p>}
              {errors.lastName && <p className={newsletterStyles.newsletterError}>{getText('lastName')}: {errors.lastName}</p>}
              {errors.email && <p className={newsletterStyles.newsletterError}>{getText('email')}: {errors.email}</p>}
              {errors.submit && <p className={newsletterStyles.newsletterError}>{errors.submit}</p>}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default Newsletter;