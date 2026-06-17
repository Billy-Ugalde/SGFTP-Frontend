export const IMAGE_TOO_LARGE_MESSAGE =
  'La imagen es demasiado grande. Usa una imagen más liviana e inténtalo de nuevo.';

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error. Por favor intenta de nuevo.',
): string {
  const err = error as any;
  const status = err?.response?.status;
  const raw = err?.response?.data?.message;

  if (status === 413) return IMAGE_TOO_LARGE_MESSAGE;

  const message = Array.isArray(raw) ? raw.filter(Boolean).join(', ') : raw;

  if (typeof message === 'string' && message.trim() !== '') {
    if (/file too large|payload too large|request entity too large/i.test(message)) {
      return IMAGE_TOO_LARGE_MESSAGE;
    }
    return message;
  }

  if (err?.request && !err?.response) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.';
  }

  return fallback;
}
