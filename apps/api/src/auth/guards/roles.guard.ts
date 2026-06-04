/**
 * @file This file contains the `RolesGuard` class responsible for enforcing role-based access control.
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@design-assets/db';

/**
 * A guard that checks if the authenticated user has the necessary roles to access a route.
 * It uses the `Reflector` to retrieve roles defined by `@Roles()` decorators.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * Constructs the RolesGuard.
   * @param reflector A Reflector instance to access metadata about the route handler and class.
   */
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the current request should be activated based on user roles.
   *
   * @param context The execution context containing details about the current request.
   * @returns `true` if the user has the required roles, otherwise throws a `ForbiddenException`.
   *          If no roles are required for the route, it returns `true`.
   * @throws {ForbiddenException} If the user does not have the necessary roles.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`Requires: ${requiredRoles.join(', ')}`);
    }
    return true;
  }
}