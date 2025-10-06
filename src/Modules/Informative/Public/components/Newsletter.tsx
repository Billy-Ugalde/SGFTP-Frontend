import React, { useState } from 'react';
import type { NewsletterSection } from '../../services/informativeService';
import subscribersService, { type CreateSubscriberRequest, type ApiError } from '../../services/NewsletterService';

interface Props {
  data: NewsletterSection;
}

const Newsletter: React.FC<Props> = ({ data }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
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
    setErrors({ firstName: '', lastName: '', email: '', submit: '' });

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
    <section className="newsletter">
      <div className="section">
        <h2 className="newsletter-title">{data.title}</h2>
        <p>{data.description}</p>

        {submitSuccess && (
          <div className="newsletter-success">
            <p>{getText('successMessage')}</p>
          </div>
        )}

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className={`newsletter-input newsletter-name-input ${errors.firstName ? 'error' : ''}`}
            placeholder={getPlaceholder('firstName')}
            value={firstName}
            onChange={handleFirstNameChange}
            onBlur={() => handleBlur('firstName')}
            disabled={isSubmitting}
            required
          />

          <input
            type="text"
            className={`newsletter-input newsletter-name-input ${errors.lastName ? 'error' : ''}`}
            placeholder={getPlaceholder('lastName')}
            value={lastName}
            onChange={handleLastNameChange}
            onBlur={() => handleBlur('lastName')}
            disabled={isSubmitting}
            required
          />

          <input
            type="email"
            className={`newsletter-input newsletter-email-input ${errors.email ? 'error' : ''}`}
            placeholder={getPlaceholder('email')}
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur('email')}
            disabled={isSubmitting}
            required
            maxLength={50}
          />

          <div className="newsletter-language-container">
            <label htmlFor="language" className="newsletter-language-label">
              {getText('preferredLanguage')}
            </label>
            <select
              id="language"
              value={language}
              onChange={handleLanguageChange}
              className="newsletter-language-select"
              disabled={isSubmitting}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <button
            type="submit"
            className="newsletter-btn newsletter-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? getText('subscribing') : getText('subscribe')}
          </button>
        </form>

        {(errors.firstName || errors.lastName || errors.email || errors.submit) && (
          <div className="newsletter-errors">
            {errors.firstName && (
              <p className="newsletter-error">
                {getText('firstName')}: {errors.firstName}
              </p>
            )}
            {errors.lastName && (
              <p className="newsletter-error">
                {getText('lastName')}: {errors.lastName}
              </p>
            )}
            {errors.email && (
              <p className="newsletter-error">
                {getText('email')}: {errors.email}
              </p>
            )}
            {errors.submit && (
              <p className="newsletter-error">{errors.submit}</p>
            )}
          </div>
        )}

        <p className="newsletter-disclaimer">
          {data.disclaimer}
        </p>
      </div>
    </section>
  );
};

export default Newsletter;