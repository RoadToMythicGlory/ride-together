import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@ride-together/shared';

/** Require ALL listed permissions. */
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/** Require ANY of the listed permissions. */
export const PERMISSIONS_ANY_KEY = 'permissions_any';
export const RequireAnyPermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_ANY_KEY, permissions);
