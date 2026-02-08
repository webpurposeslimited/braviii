const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.co.in',
  'outlook.com',
  'hotmail.com',
  'hotmail.co.uk',
  'live.com',
  'msn.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'yandex.ru',
  'protonmail.com',
  'proton.me',
  'tutanota.com',
  'fastmail.com',
  'gmx.com',
  'gmx.net',
  'inbox.com',
  'rediffmail.com',
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'naver.com',
  'daum.net',
  'hanmail.net',
  'web.de',
  'freenet.de',
  't-online.de',
  'libero.it',
  'virgilio.it',
  'laposte.net',
  'orange.fr',
  'wanadoo.fr',
  'comcast.net',
  'verizon.net',
  'att.net',
  'sbcglobal.net',
  'cox.net',
  'charter.net',
  'earthlink.net',
  'optonline.net',
  'frontier.com',
  'rocketmail.com',
]);

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'tempmail.com',
  'throwaway.email',
  'temp-mail.org',
  'fakeinbox.com',
  'sharklasers.com',
  'guerrillamailblock.com',
  'grr.la',
  'dispostable.com',
  'yopmail.com',
  'yopmail.fr',
  'nada.email',
  'getnada.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'mailnesia.com',
  'maildrop.cc',
  'discard.email',
  'harakirimail.com',
  'spamgourmet.com',
  'mytemp.email',
  'mohmal.com',
  'burnermail.io',
  'tempinbox.com',
  'tempr.email',
  'mailcatch.com',
  'mailnull.com',
  'mailsac.com',
  'emailondeck.com',
  'throwawaymail.com',
  'getairmail.com',
  'mintemail.com',
  '10minutemail.com',
  'guerrillamail.info',
  'bugmenot.com',
  'crazymailing.com',
  'mailexpire.com',
]);

export interface EmailValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateBusinessEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Invalid email format' };
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return { valid: false, reason: 'Invalid email format' };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, reason: 'Disposable email addresses are not allowed. Please use your business email.' };
  }

  if (FREE_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, reason: 'Free email providers are not allowed. Please use your business email (e.g. name@company.com).' };
  }

  return { valid: true };
}

export function isBusinessEmail(email: string): boolean {
  return validateBusinessEmail(email).valid;
}

export { FREE_EMAIL_DOMAINS, DISPOSABLE_EMAIL_DOMAINS };
