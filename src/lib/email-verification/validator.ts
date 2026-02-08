import * as dns from 'dns';
import * as net from 'net';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const resolve4 = promisify(dns.resolve4);
const resolveNs = promisify(dns.resolveNs);

export type VerificationStatus = 'valid' | 'invalid' | 'risky' | 'catch_all' | 'unknown';

export type VerificationReason =
  | 'syntax_invalid'
  | 'mx_missing'
  | 'disposable'
  | 'no_smtp'
  | 'mailbox_unavailable'
  | 'mailbox_full'
  | 'rate_limited'
  | 'timeout'
  | 'blocked'
  | 'catch_all_detected'
  | 'role_account'
  | 'unknown_error'
  | 'dns_verified'
  | 'valid';

export interface VerificationResult {
  email: string;
  status: VerificationStatus;
  reason: VerificationReason;
  mxRecords: string[];
  provider: string | null;
  isDisposable: boolean;
  isRoleAccount: boolean;
  isCatchAll: boolean;
  smtpResponse: string | null;
  verifiedAt: Date;
  dnsScore?: number;
  hasSPF?: boolean;
  hasDMARC?: boolean;
}

interface DnsCheckResult {
  hasSPF: boolean;
  hasDMARC: boolean;
  hasARecord: boolean;
  hasNS: boolean;
  spfRecord: string | null;
  dmarcRecord: string | null;
  score: number;
}

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
  '10minutemail.com', 'temp-mail.org', 'fakeinbox.com', 'trashmail.com',
  'getnada.com', 'tempail.com', 'mohmal.com', 'dispostable.com',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net',
  'spam4.me', 'grr.la', 'discard.email', 'mailnesia.com', 'tmpmail.org',
  'tmpmail.net', 'tempr.email', 'dropmail.me', 'fakemailgenerator.com',
  'emailondeck.com', 'mintemail.com', 'tempmailaddress.com', 'burnermail.io',
  'throwawaymail.com', 'mailcatch.com', 'mytrashmail.com', 'spamgourmet.com',
  'maildrop.cc', 'inboxalias.com', 'jetable.org', 'spamex.com', 'tempinbox.com',
  'guerrillamail.info', 'guerrillamail.de', 'guerrillamail.biz', 'harakirimail.com',
  'mailexpire.com', 'mailforspam.com', 'safetymail.info', 'filzmail.com',
  'trashymail.com', 'trashemail.de', 'wegwerfmail.de', 'wegwerfmail.net',
  'mailzilla.com', 'spamfree24.org', 'mailnull.com', 'e4ward.com',
  'mytemp.email', 'tempail.com', 'tempmails.net', 'tempmailo.com',
  'throwam.com', 'tmail.ws', 'trash-mail.at', 'trashmail.me',
]);

const ROLE_ACCOUNTS = new Set([
  'admin', 'administrator', 'webmaster', 'postmaster', 'hostmaster',
  'info', 'contact', 'support', 'help', 'sales', 'marketing',
  'billing', 'accounts', 'noreply', 'no-reply', 'donotreply',
  'abuse', 'spam', 'security', 'privacy', 'legal', 'compliance',
  'hr', 'jobs', 'careers', 'recruiting', 'press', 'media',
  'office', 'reception', 'feedback', 'enquiries', 'inquiries',
  'team', 'hello', 'hi', 'subscribe', 'unsubscribe', 'newsletter',
]);

const KNOWN_PROVIDERS: Record<string, string[]> = {
  'Google': ['google.com', 'googlemail.com', 'gmail.com', 'aspmx.l.google.com'],
  'Microsoft': ['outlook.com', 'hotmail.com', 'live.com', 'microsoft.com', 'protection.outlook.com'],
  'Yahoo': ['yahoo.com', 'yahoodns.net', 'yahoo.net'],
  'Zoho': ['zoho.com', 'zohomail.com'],
  'ProtonMail': ['protonmail.com', 'protonmail.ch', 'pm.me'],
  'iCloud': ['icloud.com', 'me.com', 'mac.com'],
  'AOL': ['aol.com', 'mx.aol.com'],
  'Fastmail': ['fastmail.com', 'messagingengine.com'],
  'GoDaddy': ['secureserver.net', 'godaddy.com'],
  'Yandex': ['yandex.ru', 'yandex.net'],
  'Mail.ru': ['mail.ru', 'mxs.mail.ru'],
  'Amazon SES': ['amazonses.com', 'amazonaws.com'],
  'SendGrid': ['sendgrid.net'],
  'Mailgun': ['mailgun.org'],
};

// Free email providers where any valid-looking address is likely real
const FREE_EMAIL_PROVIDERS: Record<string, string[]> = {
  'gmail.com': ['Google'],
  'yahoo.com': ['Yahoo'],
  'outlook.com': ['Microsoft'],
  'hotmail.com': ['Microsoft'],
  'live.com': ['Microsoft'],
  'aol.com': ['AOL'],
  'icloud.com': ['iCloud'],
  'me.com': ['iCloud'],
  'protonmail.com': ['ProtonMail'],
  'proton.me': ['ProtonMail'],
  'pm.me': ['ProtonMail'],
  'zoho.com': ['Zoho'],
  'yandex.com': ['Yandex'],
  'mail.ru': ['Mail.ru'],
  'gmx.com': ['GMX'],
  'fastmail.com': ['Fastmail'],
};

const SMTP_TIMEOUT = 8000;
const CONNECTION_TIMEOUT = 4000;
// Quick probe to check if port 25 is even reachable
const SMTP_PROBE_TIMEOUT = 3000;

export class EmailValidator {
  private fromEmail: string;
  private fromDomain: string;
  private smtpAvailable: boolean | null = null;

  constructor(fromEmail: string = 'verify@bravilio.com') {
    this.fromEmail = fromEmail;
    this.fromDomain = fromEmail.split('@')[1] || 'bravilio.com';
  }

  async verify(email: string): Promise<VerificationResult> {
    const result: VerificationResult = {
      email: email.toLowerCase().trim(),
      status: 'unknown',
      reason: 'unknown_error',
      mxRecords: [],
      provider: null,
      isDisposable: false,
      isRoleAccount: false,
      isCatchAll: false,
      smtpResponse: null,
      verifiedAt: new Date(),
    };

    try {
      // Step 1: Syntax validation
      if (!this.isValidSyntax(result.email)) {
        result.status = 'invalid';
        result.reason = 'syntax_invalid';
        return result;
      }

      const [localPart, domain] = result.email.split('@');

      // Step 2: Check disposable domain
      if (this.isDisposableDomain(domain)) {
        result.isDisposable = true;
        result.status = 'invalid';
        result.reason = 'disposable';
        return result;
      }

      // Step 3: Check role account
      if (this.isRoleAccount(localPart)) {
        result.isRoleAccount = true;
      }

      // Step 4: DNS MX lookup
      const mxResult = await this.getMxRecords(domain);
      if (!mxResult.success || mxResult.records.length === 0) {
        result.status = 'invalid';
        result.reason = 'mx_missing';
        return result;
      }

      result.mxRecords = mxResult.records;
      result.provider = this.detectProvider(mxResult.records);

      // Step 5: Enhanced DNS checks (SPF, DMARC, A record)
      const dnsChecks = await this.performDnsChecks(domain);
      result.hasSPF = dnsChecks.hasSPF;
      result.hasDMARC = dnsChecks.hasDMARC;
      result.dnsScore = dnsChecks.score;

      // Step 6: Try SMTP verification (with quick probe first)
      const smtpReachable = await this.isSmtpReachable(mxResult.records[0]);

      if (smtpReachable) {
        const smtpResult = await this.verifySmtp(result.email, mxResult.records);
        result.smtpResponse = smtpResult.response;
        result.isCatchAll = smtpResult.isCatchAll;

        if (smtpResult.status === 'valid') {
          if (result.isCatchAll) {
            result.status = 'catch_all';
            result.reason = 'catch_all_detected';
          } else if (result.isRoleAccount) {
            result.status = 'risky';
            result.reason = 'role_account';
          } else {
            result.status = 'valid';
            result.reason = 'valid';
          }
        } else if (smtpResult.status === 'invalid') {
          result.status = 'invalid';
          result.reason = smtpResult.reason as VerificationReason;
        } else if (smtpResult.status === 'risky') {
          result.status = 'risky';
          result.reason = smtpResult.reason as VerificationReason;
        } else {
          // SMTP returned unknown — fall through to DNS scoring
          result.smtpResponse = smtpResult.response;
          return this.applyDnsScoring(result, domain, localPart, dnsChecks);
        }
      } else {
        // Port 25 not reachable — use DNS-based scoring
        result.smtpResponse = 'Port 25 not reachable, using DNS-based verification';
        return this.applyDnsScoring(result, domain, localPart, dnsChecks);
      }

      return result;
    } catch (error) {
      result.status = 'unknown';
      result.reason = 'unknown_error';
      result.smtpResponse = error instanceof Error ? error.message : 'Unknown error';
      return result;
    }
  }

  /**
   * DNS-based scoring when SMTP is unavailable.
   * Combines MX, SPF, DMARC, provider reputation, and free-email checks
   * to produce a confidence score without needing port 25.
   */
  private applyDnsScoring(
    result: VerificationResult,
    domain: string,
    localPart: string,
    dnsChecks: DnsCheckResult
  ): VerificationResult {
    const isFreeEmail = FREE_EMAIL_PROVIDERS[domain] !== undefined;
    const hasKnownProvider = result.provider !== null;

    // High-confidence cases
    if (isFreeEmail && dnsChecks.score >= 70) {
      // Gmail, Outlook, Yahoo etc. — valid MX + SPF + DMARC = likely valid
      if (result.isRoleAccount) {
        result.status = 'risky';
        result.reason = 'role_account';
      } else {
        result.status = 'valid';
        result.reason = 'dns_verified';
      }
      return result;
    }

    if (hasKnownProvider && dnsChecks.score >= 60) {
      // Custom domain hosted on known provider with good DNS
      if (result.isRoleAccount) {
        result.status = 'risky';
        result.reason = 'role_account';
      } else {
        result.status = 'risky';
        result.reason = 'dns_verified';
      }
      return result;
    }

    // Medium-confidence: valid MX but no known provider
    if (dnsChecks.score >= 50) {
      result.status = 'risky';
      result.reason = 'dns_verified';
      return result;
    }

    // Low-confidence: MX exists but poor DNS setup
    if (dnsChecks.score >= 30) {
      result.status = 'risky';
      result.reason = 'dns_verified';
      return result;
    }

    // Very low confidence
    result.status = 'unknown';
    result.reason = 'no_smtp';
    return result;
  }

  /**
   * Perform comprehensive DNS checks on the domain.
   * Returns a score from 0-100 based on DNS health.
   */
  private async performDnsChecks(domain: string): Promise<DnsCheckResult> {
    const result: DnsCheckResult = {
      hasSPF: false,
      hasDMARC: false,
      hasARecord: false,
      hasNS: false,
      spfRecord: null,
      dmarcRecord: null,
      score: 0,
    };

    const checks = await Promise.allSettled([
      this.checkSPF(domain),
      this.checkDMARC(domain),
      this.checkARecord(domain),
      this.checkNS(domain),
    ]);

    // SPF check
    if (checks[0].status === 'fulfilled' && checks[0].value) {
      result.hasSPF = true;
      result.spfRecord = checks[0].value;
      result.score += 25;
    }

    // DMARC check
    if (checks[1].status === 'fulfilled' && checks[1].value) {
      result.hasDMARC = true;
      result.dmarcRecord = checks[1].value;
      result.score += 25;
    }

    // A record check
    if (checks[2].status === 'fulfilled' && checks[2].value) {
      result.hasARecord = true;
      result.score += 15;
    }

    // NS record check
    if (checks[3].status === 'fulfilled' && checks[3].value) {
      result.hasNS = true;
      result.score += 10;
    }

    // Bonus: MX records already verified (called before this), so add base score
    result.score += 25;

    return result;
  }

  private async checkSPF(domain: string): Promise<string | null> {
    try {
      const records = await resolveTxt(domain);
      for (const record of records) {
        const txt = record.join('');
        if (txt.toLowerCase().startsWith('v=spf1')) {
          return txt;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  private async checkDMARC(domain: string): Promise<string | null> {
    try {
      const records = await resolveTxt(`_dmarc.${domain}`);
      for (const record of records) {
        const txt = record.join('');
        if (txt.toLowerCase().startsWith('v=dmarc1')) {
          return txt;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  private async checkARecord(domain: string): Promise<boolean> {
    try {
      const records = await resolve4(domain);
      return records.length > 0;
    } catch {
      return false;
    }
  }

  private async checkNS(domain: string): Promise<boolean> {
    try {
      const records = await resolveNs(domain);
      return records.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Quick probe to check if port 25 is reachable at all.
   * Caches the result so we don't waste time on subsequent calls.
   */
  private async isSmtpReachable(mxHost: string): Promise<boolean> {
    if (this.smtpAvailable !== null) return this.smtpAvailable;

    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.removeAllListeners();
        socket.destroy();
        this.smtpAvailable = false;
        resolve(false);
      }, SMTP_PROBE_TIMEOUT);

      socket.on('connect', () => {
        clearTimeout(timeout);
        socket.removeAllListeners();
        socket.destroy();
        this.smtpAvailable = true;
        resolve(true);
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        socket.removeAllListeners();
        socket.destroy();
        this.smtpAvailable = false;
        resolve(false);
      });

      socket.on('timeout', () => {
        clearTimeout(timeout);
        socket.removeAllListeners();
        socket.destroy();
        this.smtpAvailable = false;
        resolve(false);
      });

      socket.setTimeout(SMTP_PROBE_TIMEOUT);
      socket.connect(25, mxHost);
    });
  }

  private isValidSyntax(email: string): boolean {
    const emailRegex = /^(?![.])(?!.*[.]{2})[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) return false;
    if (email.length > 254) return false;
    
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return false;
    if (localPart.length > 64) return false;
    if (domain.length > 253) return false;
    
    const domainParts = domain.split('.');
    if (domainParts.length < 2) return false;
    if (domainParts.some(part => part.length > 63)) return false;
    
    return true;
  }

  private isDisposableDomain(domain: string): boolean {
    const normalizedDomain = domain.toLowerCase();
    if (DISPOSABLE_DOMAINS.has(normalizedDomain)) return true;
    
    const parts = normalizedDomain.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      const subdomain = parts.slice(i).join('.');
      if (DISPOSABLE_DOMAINS.has(subdomain)) return true;
    }
    
    return false;
  }

  private isRoleAccount(localPart: string): boolean {
    return ROLE_ACCOUNTS.has(localPart.toLowerCase());
  }

  private async getMxRecords(domain: string): Promise<{ success: boolean; records: string[] }> {
    try {
      const records = await resolveMx(domain);
      const sortedRecords = records
        .sort((a, b) => a.priority - b.priority)
        .map(r => r.exchange.toLowerCase());
      
      return { success: true, records: sortedRecords };
    } catch (error) {
      return { success: false, records: [] };
    }
  }

  private detectProvider(mxRecords: string[]): string | null {
    for (const [provider, patterns] of Object.entries(KNOWN_PROVIDERS)) {
      for (const mx of mxRecords) {
        for (const pattern of patterns) {
          if (mx.includes(pattern)) {
            return provider;
          }
        }
      }
    }
    return null;
  }

  private async verifySmtp(
    email: string,
    mxRecords: string[]
  ): Promise<{
    status: 'valid' | 'invalid' | 'risky' | 'unknown';
    reason: string;
    response: string;
    isCatchAll: boolean;
  }> {
    for (const mx of mxRecords.slice(0, 3)) {
      try {
        const result = await this.smtpHandshake(email, mx);
        return result;
      } catch (error) {
        continue;
      }
    }

    return {
      status: 'unknown',
      reason: 'no_smtp',
      response: 'Could not connect to any MX server',
      isCatchAll: false,
    };
  }

  private smtpHandshake(
    email: string,
    mxHost: string
  ): Promise<{
    status: 'valid' | 'invalid' | 'risky' | 'unknown';
    reason: string;
    response: string;
    isCatchAll: boolean;
  }> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let response = '';
      let stage = 0;
      let resolved = false;
      const domain = email.split('@')[1];

      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          socket.removeAllListeners();
          socket.destroy();
        }
      };

      const timeout = setTimeout(() => {
        cleanup();
        resolve({
          status: 'unknown',
          reason: 'timeout',
          response: 'Connection timeout',
          isCatchAll: false,
        });
      }, SMTP_TIMEOUT);

      socket.setTimeout(CONNECTION_TIMEOUT);

      socket.on('timeout', () => {
        clearTimeout(timeout);
        cleanup();
        resolve({
          status: 'unknown',
          reason: 'timeout',
          response: 'Socket timeout',
          isCatchAll: false,
        });
      });

      socket.on('error', (err) => {
        clearTimeout(timeout);
        cleanup();
        resolve({
          status: 'unknown',
          reason: 'no_smtp',
          response: err.message,
          isCatchAll: false,
        });
      });

      socket.on('data', (data) => {
        response = data.toString();
        const code = parseInt(response.substring(0, 3), 10);

        try {
          switch (stage) {
            case 0: // Initial connection
              if (code === 220) {
                stage = 1;
                socket.write(`EHLO ${this.fromDomain}\r\n`);
              } else {
                clearTimeout(timeout);
                cleanup();
                resolve({
                  status: 'unknown',
                  reason: 'blocked',
                  response,
                  isCatchAll: false,
                });
              }
              break;

            case 1: // After EHLO
              if (code === 250) {
                stage = 2;
                socket.write(`MAIL FROM:<${this.fromEmail}>\r\n`);
              } else {
                clearTimeout(timeout);
                cleanup();
                resolve({
                  status: 'unknown',
                  reason: 'blocked',
                  response,
                  isCatchAll: false,
                });
              }
              break;

            case 2: // After MAIL FROM
              if (code === 250) {
                stage = 3;
                socket.write(`RCPT TO:<${email}>\r\n`);
              } else if (code === 421 || code === 450 || code === 451) {
                clearTimeout(timeout);
                cleanup();
                resolve({
                  status: 'risky',
                  reason: 'rate_limited',
                  response,
                  isCatchAll: false,
                });
              } else {
                clearTimeout(timeout);
                cleanup();
                resolve({
                  status: 'unknown',
                  reason: 'blocked',
                  response,
                  isCatchAll: false,
                });
              }
              break;

            case 3: // After RCPT TO - This is the key response
              clearTimeout(timeout);
              socket.write('QUIT\r\n');
              
              if (code === 250 || code === 251) {
                // Now check for catch-all by testing a random invalid address
                this.checkCatchAll(mxHost, domain).then((isCatchAll) => {
                  cleanup();
                  resolve({
                    status: 'valid',
                    reason: 'valid',
                    response,
                    isCatchAll,
                  });
                }).catch(() => {
                  cleanup();
                  resolve({
                    status: 'valid',
                    reason: 'valid',
                    response,
                    isCatchAll: false,
                  });
                });
                return;
              } else if (code === 550 || code === 551 || code === 552 || code === 553 || code === 554) {
                cleanup();
                const lowerResponse = response.toLowerCase();
                if (lowerResponse.includes('mailbox full') || lowerResponse.includes('quota')) {
                  resolve({
                    status: 'risky',
                    reason: 'mailbox_full',
                    response,
                    isCatchAll: false,
                  });
                } else {
                  resolve({
                    status: 'invalid',
                    reason: 'mailbox_unavailable',
                    response,
                    isCatchAll: false,
                  });
                }
              } else if (code === 421 || code === 450 || code === 451 || code === 452) {
                cleanup();
                resolve({
                  status: 'risky',
                  reason: 'rate_limited',
                  response,
                  isCatchAll: false,
                });
              } else {
                cleanup();
                resolve({
                  status: 'unknown',
                  reason: 'unknown_error',
                  response,
                  isCatchAll: false,
                });
              }
              break;
          }
        } catch (err) {
          clearTimeout(timeout);
          cleanup();
          resolve({
            status: 'unknown',
            reason: 'unknown_error',
            response: err instanceof Error ? err.message : 'Parse error',
            isCatchAll: false,
          });
        }
      });

      socket.connect(25, mxHost);
    });
  }

  private checkCatchAll(mxHost: string, domain: string): Promise<boolean> {
    return new Promise((resolve) => {
      const randomEmail = `bravilio-catchall-test-${Date.now()}-${Math.random().toString(36).substring(7)}@${domain}`;
      const socket = new net.Socket();
      let stage = 0;
      let resolved = false;

      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          socket.removeAllListeners();
          socket.destroy();
        }
      };

      const timeout = setTimeout(() => {
        cleanup();
        resolve(false);
      }, 5000);

      socket.setTimeout(3000);
      socket.on('timeout', () => { clearTimeout(timeout); cleanup(); resolve(false); });
      socket.on('error', () => { clearTimeout(timeout); cleanup(); resolve(false); });

      socket.on('data', (data) => {
        const response = data.toString();
        const code = parseInt(response.substring(0, 3), 10);

        try {
          switch (stage) {
            case 0:
              if (code === 220) { stage = 1; socket.write(`EHLO ${this.fromDomain}\r\n`); }
              else { clearTimeout(timeout); cleanup(); resolve(false); }
              break;
            case 1:
              if (code === 250) { stage = 2; socket.write(`MAIL FROM:<${this.fromEmail}>\r\n`); }
              else { clearTimeout(timeout); cleanup(); resolve(false); }
              break;
            case 2:
              if (code === 250) { stage = 3; socket.write(`RCPT TO:<${randomEmail}>\r\n`); }
              else { clearTimeout(timeout); cleanup(); resolve(false); }
              break;
            case 3:
              clearTimeout(timeout);
              socket.write('QUIT\r\n');
              cleanup();
              // If random email is accepted, it's a catch-all
              resolve(code === 250 || code === 251);
              break;
          }
        } catch {
          clearTimeout(timeout);
          cleanup();
          resolve(false);
        }
      });

      socket.connect(25, mxHost);
    });
  }
}

export const emailValidator = new EmailValidator();
