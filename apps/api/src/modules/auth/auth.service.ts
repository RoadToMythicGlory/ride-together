import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { loadEnv } from '@ride-together/config';
import { CONSENT_TYPES, LEGAL_VERSIONS, TENANT_ROLES } from '@ride-together/shared';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleAuthDto, LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly env = loadEnv();
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
    private readonly outbox: OutboxService,
    private readonly mail: MailService,
  ) {}

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueTokens(userId: string, email: string, activeTenantId: string | null) {
    const accessToken = await this.jwt.signAsync({
      sub: userId,
      email,
      activeTenantId,
    });

    const refreshToken = randomBytes(48).toString('hex');
    const days = Number(this.env.JWT_REFRESH_TTL.replace('d', '')) || 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken, expiresAt };
  }

  private async issueAuthToken(
    userId: string,
    type: 'EMAIL_VERIFY' | 'PASSWORD_RESET',
    hours: number,
  ) {
    const token = randomBytes(32).toString('hex');
    await this.prisma.authToken.create({
      data: {
        userId,
        type,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
      },
    });
    return token;
  }

  async register(dto: RegisterDto) {
    if (dto.capabilities.length === 0) {
      throw new BadRequestException('Select at least one capability');
    }
    if (!dto.ageAttested18 || !dto.acceptedTerms || !dto.acceptedPrivacy) {
      throw new BadRequestException(
        'Age attestation and acceptance of Terms and Privacy Policy are required',
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new BadRequestException('Email already registered');

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: this.env.DEFAULT_TENANT_SLUG },
    });
    if (!tenant) throw new BadRequestException('Default tenant missing');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          fullName: dto.fullName,
          phone: dto.phone,
          passwordHash,
          locale: 'he',
        },
      });

      const membership = await tx.tenantMembership.create({
        data: { tenantId: tenant.id, userId: user.id },
      });

      for (const capability of dto.capabilities) {
        const role = await tx.role.findUniqueOrThrow({
          where: {
            tenantId_key: { tenantId: tenant.id, key: capability },
          },
        });
        await tx.membershipRole.create({
          data: { membershipId: membership.id, roleId: role.id },
        });

        if (capability === TENANT_ROLES.RIDER) {
          await tx.riderProfile.create({
            data: { userId: user.id, tenantId: tenant.id },
          });
        }
        if (capability === TENANT_ROLES.PARENT) {
          await tx.parentProfile.create({
            data: { userId: user.id, tenantId: tenant.id },
          });
        }
      }

      await tx.consent.createMany({
        data: [
          {
            actorUserId: user.id,
            consentType: CONSENT_TYPES.AGE_ATTESTATION_18,
            version: LEGAL_VERSIONS.ageAttestation,
            accepted: true,
          },
          {
            actorUserId: user.id,
            consentType: CONSENT_TYPES.TERMS_OF_SERVICE,
            version: LEGAL_VERSIONS.terms,
            accepted: true,
          },
          {
            actorUserId: user.id,
            consentType: CONSENT_TYPES.PRIVACY_POLICY,
            version: LEGAL_VERSIONS.privacy,
            accepted: true,
          },
        ],
      });

      await this.outbox.enqueue(
        {
          tenantId: tenant.id,
          aggregateType: 'User',
          aggregateId: user.id,
          eventType: 'UserRegistered',
          payload: {
            userId: user.id,
            capabilities: dto.capabilities,
          },
          idempotencyKey: `user-registered:${user.id}`,
        },
        tx,
      );

      return user;
    });

    const verifyToken = await this.issueAuthToken(result.id, 'EMAIL_VERIFY', 48);
    const verifyUrl = `${this.env.APP_PUBLIC_URL}/verify-email?token=${verifyToken}`;
    await this.mail.send({
      to: result.email,
      subject: 'אימות אימייל · RideTogether',
      text: `שלום ${result.fullName},\n\nאשרו את האימייל כאן:\n${verifyUrl}\n\nהקישור תקף ל־48 שעות.`,
    });

    await this.audit.log({
      actorUserId: result.id,
      tenantId: tenant.id,
      action: 'user.registered',
      entityType: 'User',
      entityId: result.id,
      metadata: { capabilities: dto.capabilities },
    });

    const tokens = await this.issueTokens(result.id, result.email, tenant.id);
    return {
      user: {
        id: result.id,
        email: result.email,
        fullName: result.fullName,
        emailVerified: false,
      },
      tenant: { id: tenant.id, slug: tenant.slug },
      ...tokens,
      ...(this.env.NODE_ENV !== 'production' ? { devVerifyToken: verifyToken } : {}),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { tenant: true },
        },
      },
    });
    if (!user || !user.isActive || user.suspendedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (this.env.REQUIRE_EMAIL_VERIFICATION && !user.emailVerifiedAt) {
      throw new UnauthorizedException('Email not verified');
    }

    const membership =
      (dto.tenantSlug
        ? user.memberships.find((m) => m.tenant.slug === dto.tenantSlug)
        : user.memberships.find(
            (m) => m.tenant.slug === this.env.DEFAULT_TENANT_SLUG,
          )) ?? user.memberships[0];

    if (!membership) throw new UnauthorizedException('No tenant membership');

    const tokens = await this.issueTokens(
      user.id,
      user.email,
      membership.tenantId,
    );

    await this.audit.log({
      actorUserId: user.id,
      tenantId: membership.tenantId,
      action: 'user.login',
      entityType: 'User',
      entityId: user.id,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: Boolean(user.emailVerifiedAt),
      },
      tenant: { id: membership.tenant.id, slug: membership.tenant.slug },
      ...tokens,
    };
  }

  private googleAudiences(): string[] {
    return [
      this.env.GOOGLE_CLIENT_ID,
      this.env.GOOGLE_CLIENT_ID_IOS,
      this.env.GOOGLE_CLIENT_ID_ANDROID,
    ].filter((v): v is string => Boolean(v));
  }

  /**
   * Sign in (or register) with a Google ID token.
   *
   * - Existing account with the same (Google-verified) email → login.
   * - No account and registration consents provided → create the account.
   * - No account and no consents → { needsRegistration: true } so the client
   *   can send the user to the registration form (Google-mode, no password).
   */
  async googleLogin(dto: GoogleAuthDto) {
    const audiences = this.googleAudiences();
    if (audiences.length === 0) {
      throw new BadRequestException('Google login is not configured');
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: audiences,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
    if (!payload?.email || payload.email_verified !== true) {
      throw new UnauthorizedException('Google account has no verified email');
    }

    const email = payload.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { tenant: true },
        },
      },
    });

    if (user) {
      if (!user.isActive || user.suspendedAt) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Google verified this email — mark it verified if it isn't yet.
      if (!user.emailVerifiedAt) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { emailVerifiedAt: new Date() },
        });
      }

      const membership =
        (dto.tenantSlug
          ? user.memberships.find((m) => m.tenant.slug === dto.tenantSlug)
          : user.memberships.find(
              (m) => m.tenant.slug === this.env.DEFAULT_TENANT_SLUG,
            )) ?? user.memberships[0];
      if (!membership) throw new UnauthorizedException('No tenant membership');

      const tokens = await this.issueTokens(
        user.id,
        user.email,
        membership.tenantId,
      );

      await this.audit.log({
        actorUserId: user.id,
        tenantId: membership.tenantId,
        action: 'user.login',
        entityType: 'User',
        entityId: user.id,
        metadata: { method: 'google' },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          emailVerified: true,
        },
        tenant: { id: membership.tenant.id, slug: membership.tenant.slug },
        ...tokens,
      };
    }

    // New user — we need explicit consents + capabilities to create an account.
    const hasRegistrationFields =
      Array.isArray(dto.capabilities) &&
      dto.capabilities.length > 0 &&
      dto.ageAttested18 === true &&
      dto.acceptedTerms === true &&
      dto.acceptedPrivacy === true;

    if (!hasRegistrationFields) {
      return {
        needsRegistration: true,
        email,
        fullName: payload.name ?? '',
      };
    }

    // Google users have no password — store an unguessable random hash.
    const randomPassword = randomBytes(32).toString('hex');
    const registered = await this.registerGoogleUser({
      email,
      fullName:
        dto.fullName?.trim() || payload.name?.trim() || email.split('@')[0],
      phone: dto.phone,
      capabilities: dto.capabilities!,
      passwordHash: await bcrypt.hash(randomPassword, 12),
    });
    return registered;
  }

  private async registerGoogleUser(input: {
    email: string;
    fullName: string;
    phone?: string;
    capabilities: Array<'RIDER' | 'PARENT'>;
    passwordHash: string;
  }) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: this.env.DEFAULT_TENANT_SLUG },
    });
    if (!tenant) throw new BadRequestException('Default tenant missing');

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          fullName: input.fullName,
          phone: input.phone,
          passwordHash: input.passwordHash,
          locale: 'he',
          emailVerifiedAt: new Date(), // verified by Google
        },
      });

      const membership = await tx.tenantMembership.create({
        data: { tenantId: tenant.id, userId: user.id },
      });

      for (const capability of input.capabilities) {
        const role = await tx.role.findUniqueOrThrow({
          where: {
            tenantId_key: { tenantId: tenant.id, key: capability },
          },
        });
        await tx.membershipRole.create({
          data: { membershipId: membership.id, roleId: role.id },
        });

        if (capability === TENANT_ROLES.RIDER) {
          await tx.riderProfile.create({
            data: { userId: user.id, tenantId: tenant.id },
          });
        }
        if (capability === TENANT_ROLES.PARENT) {
          await tx.parentProfile.create({
            data: { userId: user.id, tenantId: tenant.id },
          });
        }
      }

      await tx.consent.createMany({
        data: [
          {
            actorUserId: user.id,
            consentType: CONSENT_TYPES.AGE_ATTESTATION_18,
            version: LEGAL_VERSIONS.ageAttestation,
            accepted: true,
          },
          {
            actorUserId: user.id,
            consentType: CONSENT_TYPES.TERMS_OF_SERVICE,
            version: LEGAL_VERSIONS.terms,
            accepted: true,
          },
          {
            actorUserId: user.id,
            consentType: CONSENT_TYPES.PRIVACY_POLICY,
            version: LEGAL_VERSIONS.privacy,
            accepted: true,
          },
        ],
      });

      await this.outbox.enqueue(
        {
          tenantId: tenant.id,
          aggregateType: 'User',
          aggregateId: user.id,
          eventType: 'UserRegistered',
          payload: {
            userId: user.id,
            capabilities: input.capabilities,
          },
          idempotencyKey: `user-registered:${user.id}`,
        },
        tx,
      );

      return user;
    });

    await this.audit.log({
      actorUserId: result.id,
      tenantId: tenant.id,
      action: 'user.registered',
      entityType: 'User',
      entityId: result.id,
      metadata: { capabilities: input.capabilities, method: 'google' },
    });

    const tokens = await this.issueTokens(result.id, result.email, tenant.id);
    return {
      user: {
        id: result.id,
        email: result.email,
        fullName: result.fullName,
        emailVerified: true,
      },
      tenant: { id: tenant.id, slug: tenant.slug },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: {
        user: {
          include: {
            memberships: {
              where: { status: 'ACTIVE' },
              include: { tenant: true },
            },
          },
        },
      },
    });
    if (!stored) throw new UnauthorizedException('Invalid refresh token');
    if (!stored.user.isActive || stored.user.suspendedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const membership =
      stored.user.memberships.find(
        (m) => m.tenant.slug === this.env.DEFAULT_TENANT_SLUG,
      ) ?? stored.user.memberships[0];

    return this.issueTokens(
      stored.user.id,
      stored.user.email,
      membership?.tenantId ?? null,
    );
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);
    const row = await this.prisma.authToken.findFirst({
      where: {
        tokenHash,
        type: 'EMAIL_VERIFY',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!row) throw new BadRequestException('Invalid or expired verification token');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.authToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { ok: true, verified: true };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    // Always OK — do not reveal whether email exists
    if (!user || !user.isActive) {
      return { ok: true };
    }

    const token = await this.issueAuthToken(user.id, 'PASSWORD_RESET', 2);
    const resetUrl = `${this.env.APP_PUBLIC_URL}/reset-password?token=${token}`;
    await this.mail.send({
      to: user.email,
      subject: 'איפוס סיסמה · RideTogether',
      text: `שלום ${user.fullName},\n\nלאיפוס סיסמה:\n${resetUrl}\n\nהקישור תקף לשעתיים. אם לא ביקשתם — התעלמו.`,
    });

    return {
      ok: true,
      ...(this.env.NODE_ENV !== 'production' ? { devResetToken: token } : {}),
    };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = this.hashToken(token);
    const row = await this.prisma.authToken.findFirst({
      where: {
        tokenHash,
        type: 'PASSWORD_RESET',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!row) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(password, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
      this.prisma.authToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: row.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { ok: true };
  }

  async switchTenant(userId: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { tenantId, status: 'ACTIVE' },
          include: { tenant: true },
        },
      },
    });
    if (!user || !user.isActive) throw new UnauthorizedException();
    const membership = user.memberships[0];
    if (!membership) {
      throw new BadRequestException('Not a member of this tenant');
    }

    // Revoke current refresh tokens for clean switch
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens(user.id, user.email, tenantId);
    await this.audit.log({
      actorUserId: user.id,
      tenantId,
      action: 'user.tenant_switched',
      entityType: 'Tenant',
      entityId: tenantId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      tenant: {
        id: membership.tenant.id,
        slug: membership.tenant.slug,
        name: membership.tenant.name,
      },
      ...tokens,
    };
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new BadRequestException('User not found');
    if (user.emailVerifiedAt) return { ok: true, alreadyVerified: true };

    const token = await this.issueAuthToken(user.id, 'EMAIL_VERIFY', 48);
    const verifyUrl = `${this.env.APP_PUBLIC_URL}/verify-email?token=${token}`;
    await this.mail.send({
      to: user.email,
      subject: 'אימות אימייל · RideTogether',
      text: `אשרו את האימייל כאן:\n${verifyUrl}`,
    });

    return {
      ok: true,
      ...(this.env.NODE_ENV !== 'production' ? { devVerifyToken: token } : {}),
    };
  }
}
