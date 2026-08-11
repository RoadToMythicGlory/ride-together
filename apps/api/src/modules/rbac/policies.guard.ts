import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLATFORM_ROLES, type Permission } from '@ride-together/shared';
import type { RequestUser } from '../../common/request-context';
import {
  PERMISSIONS_ANY_KEY,
  PERMISSIONS_KEY,
} from './require-permission.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allOf =
      this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    const anyOf =
      this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_ANY_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (allOf.length === 0 && anyOf.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = req.user;
    if (!user) throw new ForbiddenException('Unauthenticated');

    if (user.platformRoles.includes(PLATFORM_ROLES.SUPER_ADMIN)) {
      return true;
    }

    const granted = new Set(user.permissions ?? []);

    if (allOf.length > 0 && !allOf.every((p) => granted.has(p))) {
      throw new ForbiddenException('Insufficient permissions');
    }
    if (anyOf.length > 0 && !anyOf.some((p) => granted.has(p))) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
