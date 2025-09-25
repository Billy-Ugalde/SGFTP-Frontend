import React, { useState } from 'react';
import type { NewsletterSection } from '../../services/informativeService';

interface Props {
  data: NewsletterSection;
}

const Newsletter: React.FC<Props> = ({ data }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('es');
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string, field: 'firstName' | 'lastName'): boolean => {
    if (name.length < 3) {
      setErrors(prev => ({ ...prev, [field]: 'Debe tener al menos 3 caracteres' }));
      return false;
    } else if (name.length > 20) {
      setErrors(prev => ({ ...prev, [field]: 'No puede tener más de 20 caracteres' }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    }
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length <= 20) {
      setFirstName(value);
      if (errors.firstName) {
        validateName(value, 'firstName');
      }
    } else {
      setErrors(prev => ({ ...prev, firstName: 'No puede tener más de 20 caracteres' }));
    }
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length <= 20) {
      setLastName(value);
      if (errors.lastName) {
        validateName(value, 'lastName');
      }
    } else {
      setErrors(prev => ({ ...prev, lastName: 'No puede tener más de 20 caracteres' }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length <= 50) {
      setEmail(value);
      setErrors(prev => ({ ...prev, email: '' }));
    } else {
      setErrors(prev => ({ ...prev, email: 'El correo no puede tener más de 50 caracteres' }));
    }
  };

  const handleBlur = (field: 'firstName' | 'lastName' | 'email') => {
    switch (field) {
      case 'firstName':
        validateName(firstName, 'firstName');
        break;
      case 'lastName':
        validateName(lastName, 'lastName');
        break;
      case 'email':
        if (email && !validateEmail(email)) {
          setErrors(prev => ({ ...prev, email: 'Por favor ingresa un correo electrónico válido' }));
        }
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isFirstNameValid = validateName(firstName, 'firstName');
    const isLastNameValid = validateName(lastName, 'lastName');

    let isEmailValid = true;
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Por favor ingresa tu correo electrónico' }));
      isEmailValid = false;
    } else if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Por favor ingresa un correo electrónico válido' }));
      isEmailValid = false;
    } else if (email.length > 50) {
      setErrors(prev => ({ ...prev, email: 'El correo no puede tener más de 50 caracteres' }));
      isEmailValid = false;
    }

    if (!isFirstNameValid || !isLastNameValid || !isEmailValid) {
      return;
    }

    setErrors({ firstName: '', lastName: '', email: '' });

    const message = language === 'es'
      ? `¡Gracias por suscribirte ${firstName} ${lastName}! Te mantendremos informado sobre nuestras actividades.`
      : `Thank you for subscribing ${firstName} ${lastName}! We will keep you informed about our activities.`;

    alert(message);

    setFirstName('');
    setLastName('');
    setEmail('');
    setLanguage('es');
  };

  return (
    <section className="newsletter">
      <div className="section">
        <h2 className="newsletter-title">{data.title}</h2>
        <p>{data.description}</p>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="newsletter-input newsletter-name-input"
            placeholder={language === 'es' ? 'Tu nombre' : 'Your first name'}
            value={firstName}
            onChange={handleFirstNameChange}
            onBlur={() => handleBlur('firstName')}
            minLength={3}
            maxLength={20}
            required
          />

          <input
            type="text"
            className="newsletter-input newsletter-name-input"
            placeholder={language === 'es' ? 'Tu apellido' : 'Your last name'}
            value={lastName}
            onChange={handleLastNameChange}
            onBlur={() => handleBlur('lastName')}
            minLength={3}
            maxLength={20}
            required
          />

          <input
            type="email"
            className="newsletter-input newsletter-email-input"
            placeholder={language === 'es' ? 'Tu correo electrónico' : 'Your email address'}
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur('email')}
            maxLength={50}
            required
          />

          <div className="newsletter-language-container">
            <label htmlFor="language" className="newsletter-language-label">
              {language === 'es' ? 'Idioma preferido:' : 'Preferred language:'}
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="newsletter-language-select"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <button type="submit" className="newsletter-btn newsletter-submit-btn">
            {language === 'es' ? 'Suscribirse' : 'Subscribe'}
          </button>
        </form>

        {(errors.firstName || errors.lastName || errors.email) && (
          <div className="newsletter-errors">
            {errors.firstName && (
              <p className="newsletter-error">
                {language === 'es' ? `Nombre: ${errors.firstName}` : `First name: ${errors.firstName}`}
              </p>
            )}
            {errors.lastName && (
              <p className="newsletter-error">
                {language === 'es' ? `Apellido: ${errors.lastName}` : `Last name: ${errors.lastName}`}
              </p>
            )}
            {errors.email && (
              <p className="newsletter-error">
                {language === 'es' ? `Email: ${errors.email}` : `Email: ${errors.email}`}
              </p>
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