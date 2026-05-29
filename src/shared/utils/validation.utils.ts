/**
 * Shared validation utilities for form fields.
 * Centralizes rules used across Volunteer and Project modules.
 */

/** Letters (incl. Spanish accented), spaces, hyphens and apostrophes — for proper names. */
export const NAME_PATTERN = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s\-']+$/;

/** No HTML angle-brackets — prevents script/tag injection in free-text fields. */
export const SAFE_TEXT_PATTERN = /^[^<>]*$/;

export const EMAIL_PATTERN = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

export const ALLOWED_EMAIL_DOMAINS: string[] = [
  'gmail.com', 'googlemail.com',
  'outlook.com', 'outlook.es', 'outlook.com.mx',
  'hotmail.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'yahoo.com', 'yahoo.es', 'ymail.com', 'rocketmail.com',
  'aol.com',
  'proton.me', 'protonmail.com',
  'zoho.com',
  'gmx.com', 'gmx.de',
  'mail.com',
  'yandex.com', 'yandex.ru',
  'fastmail.com',
  'tuta.com', 'tutanota.com',
  'hey.com',
];

/** Institutional domains matched by suffix (subdomains allowed). */
export const ALLOWED_DOMAIN_PATTERNS: string[] = [
  '.ucr.ac.cr',
  '.una.ac.cr',
  '.go.cr',
];

/** Returns true if the email's domain is on the allow-list. */
export function validateEmailDomain(email: string): boolean {
  const parts = email.toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  if (ALLOWED_EMAIL_DOMAINS.includes(domain)) return true;
  return ALLOWED_DOMAIN_PATTERNS.some(pattern => domain.endsWith(pattern));
}

/**
 * Validates a proper-name field.
 * Returns an error message string, or undefined when valid.
 */
export function validateName(
  value: string | undefined,
  label = 'El campo',
  required = true,
  minLength = 2,
): string | undefined {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return required ? `${label} es obligatorio.` : undefined;
  if (trimmed.length < minLength) return `${label} debe tener al menos ${minLength} caracteres.`;
  if (!NAME_PATTERN.test(trimmed)) {
    return `${label} solo puede contener letras, espacios y caracteres del español (tildes, ñ, guiones).`;
  }
  return undefined;
}

/**
 * Validates a free-text field ensuring no HTML tags are present.
 * Returns an error message string, or undefined when valid.
 */
export function validateSafeText(
  value: string | undefined,
  label = 'El campo',
  required = true,
): string | undefined {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return required ? `${label} es obligatorio.` : undefined;
  if (!SAFE_TEXT_PATTERN.test(trimmed)) {
    return `${label} no puede contener caracteres HTML (<, >).`;
  }
  return undefined;
}

/** Strips HTML tags and removes angle-brackets from a string before sending to the API. */
export function sanitizeInput(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}
