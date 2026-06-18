import { isValidPhoneNumber, parsePhoneNumberWithError } from 'libphonenumber-js';

export function validatePhone(value: string | undefined | null): boolean {
  if (!value || !value.trim()) return false;
  try {
    return isValidPhoneNumber(value.trim());
  } catch {
    return false;
  }
}

export function toE164(value: string | undefined | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 8) return `+506${digits}`;
  return `+${digits}`;
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
