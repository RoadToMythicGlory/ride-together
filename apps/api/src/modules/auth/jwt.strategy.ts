import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { loadEnv } from '@ride-together/config';
import {
  PLATFORM_PERMISSIONS,
  PLATFORM_ROLES,
  type Permission,
  type PlatformRole,
  type TenantRole,
} from '@ride-together/shared';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { RequestUser } from '../../common/request-context';
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  activeTenantId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const env = loadEnv();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        platformRoles: true,
        memberships: {
          where: payload.activeTenantId
            ? { tenantId: payload.activeTenantId, status: 'ACTIVE' }
            : { status: 'ACTIVE' },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: { include: { permission: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive || user.suspendedAt) {
      throw new UnauthorizedException();
    }

    const membership =
      user.memberships.find((m) => m.tenantId === payload.activeTenantId) ??
      user.memberships[0] ??
      null;

    const platformRoles = user.platformRoles.map((r) => r.role as PlatformRole);
    const tenantRoles = (membership?.roles.map((r) => r.role.key) ??
      []) as TenantRole[];

    const permissions = new Set<Permission>();
    for (const pr of platformRoles) {
      for (const p of PLATFORM_PERMISSIONS[pr] ?? []) permissions.add(p);
    }
    for (const mr of membership?.roles ?? []) {
      for (const rp of mr.role.permissions) {
        permissions.add(rp.permission.key as Permission);
      }
    }

    return {
      userId: user.id,
      email: user.email,
      platformRoles,
      activeTenantId: membership?.tenantId ?? null,
      tenantRoles,
      permissions: [...permissions],
    };
  }
}
