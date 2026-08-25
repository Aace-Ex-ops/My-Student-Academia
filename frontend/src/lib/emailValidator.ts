/**
 * Certified Email Validator for Client-side Student Enrollment
 */

// Strictly blocked disposable/burner email domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  '10minutemail.com',
  '10minutemail.net',
  'throwawaymail.com',
  'sharklasers.com',
  'yopmail.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'dispostable.com',
  'fakeinbox.com',
  'getairmail.com',
  'crazymailing.com',
  'generator.email',
  'mohmal.com',
  'mytemp.email',
  'dropmail.me',
  'burnermail.io',
  'inboxkitten.com',
  'tempail.com',
  'getnada.com',
  'abcvg.com',
  'emailfake.com',
  'fakemailgenerator.com',
]);

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface EmailValidationResult {
  isValid: boolean;
  isCertified: boolean;
  isDisposable: boolean;
  isAcademicDomain: boolean;
  error?: string;
}

export function validateCertifiedEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return {
      isValid: false,
      isCertified: false,
      isDisposable: false,
      isAcademicDomain: false,
      error: 'Please enter your email address.',
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Syntax Regex Check
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return {
      isValid: false,
      isCertified: false,
      isDisposable: false,
      isAcademicDomain: false,
      error: 'Please enter a valid email format (e.g. name@university.edu).',
    };
  }

  const parts = normalizedEmail.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      isCertified: false,
      isDisposable: false,
      isAcademicDomain: false,
      error: 'Invalid email address.',
    };
  }

  const domain = parts[1];

  // 2. Reject Disposable / Burner Domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: true,
      isCertified: false,
      isDisposable: true,
      isAcademicDomain: false,
      error: 'Temporary/burner emails are not certified for university enrollment. Please use an institutional or student email.',
    };
  }

  // 3. Academic Domain Check
  const isAcademic =
    domain.endsWith('.edu') ||
    domain.endsWith('.ac.in') ||
    domain.endsWith('.edu.in') ||
    domain.endsWith('.ac.uk') ||
    domain.endsWith('.edu.au') ||
    domain.endsWith('.edu.sg') ||
    domain.endsWith('.edu.cn') ||
    domain.endsWith('.ac.za') ||
    domain.endsWith('.ernet.in');

  return {
    isValid: true,
    isCertified: true,
    isDisposable: false,
    isAcademicDomain: isAcademic,
  };
}
