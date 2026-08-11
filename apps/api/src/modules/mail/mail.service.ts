import { Injectable, Logger } from '@nestjs/common';
import { loadEnv } from '@ride-together/config';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);
  private readonly env = loadEnv();

  async send(message: MailMessage) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dir = join(process.cwd(), '../../logs/mail');
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, `${stamp}-${message.to.replace(/[^a-z0-9@._-]/gi, '_')}.txt`),
        `To: ${message.to}\nFrom: ${this.env.MAIL_FROM}\nSubject: ${message.subject}\n\n${message.text}\n`,
        'utf8',
      );
    } catch {
      // best-effort file log
    }

    this.log.log(`MAIL → ${message.to} | ${message.subject}`);
    this.log.debug(message.text);

    if (this.env.SMTP_URL) {
      // SMTP transport can be wired here later; file+console delivery is enough for review/dev.
      this.log.warn('SMTP_URL set but transport not configured — message logged only');
    }

    return { ok: true as const };
  }
}
