import { isValidPhoneNumber, parsePhoneNumberWithError } from 'libphonenumber-js';

export function validatePhone(value: string | undefined | null): boolean {
  if (!value || !value.trim()) return false;
  try {
    return isValidPhoneNumber(value.trim());
  } catch {
    return false;
  }
}

export function formatPhoneForDisplay(e164: string | undefined | null): string {
  if (!e164) return '';
  try {
    const parsed = parsePhoneNumberWithError(e164);
    if (!parsed) return e164;
    return parsed.formatInternational();
  } catch {
    return e164;
  }
}

export function buildWhatsAppUrl(e164: string | undefined | null): string {
  if (!e164) return '';
  const digits = e164.replace(/^\+/, '').replace(/\D/g, '');
  return `https://api.whatsapp.com/send?phone=${digits}`;
}
