const SQL_PATTERNS = [
  /\bUNION\s+(?:ALL\s+)?SELECT\b/i,
  /;\s*(?:DROP|DELETE|TRUNCATE|CREATE|ALTER|EXEC(?:UTE)?)\b/i,
  /'\s*(?:OR|AND)\s+['"\d(]/i,
  /\b(?:OR|AND)\s+\d+\s*=\s*\d+\b/i,
  /'\s*[;-]{1,2}/,
  /\/\*/,
];

export const hasSqlInjection = (value: string): boolean =>
  SQL_PATTERNS.some((re) => re.test(value));

export const SQL_INJECTION_MESSAGE =
  'El texto contiene una secuencia no permitida.';
