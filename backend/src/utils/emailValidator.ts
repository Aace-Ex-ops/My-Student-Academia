/**
 * Certified Email Validator for Academic Enrollment
 * Validates email syntax, blocks disposable/burner domains, and verifies certified academic/student domains.
 */

// List of strictly blocked burner / disposable temporary email domains
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
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      isCertified: false,
      isDisposable: false,
      isAcademicDomain: false,
      error: 'Email address is required.',
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Syntax check
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return {
      isValid: false,
      isCertified: false,
      isDisposable: false,
      isAcademicDomain: false,
      error: 'Invalid email address format.',
    };
  }

  const domain = normalizedEmail.split('@')[1];

  // 2. Check for disposable / burner domain
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: true,
      isCertified: false,
      isDisposable: true,
      isAcademicDomain: false,
      error: 'Temporary or disposable burner emails are not certified for university enrollment.',
    };
  }

  // 3. Check for academic domain suffixes
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
