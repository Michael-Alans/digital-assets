/**
 * A decorator factory that sets metadata for required user roles.
 * Routes protected with this decorator will only be accessible to users
 * possessing at least one of the specified roles. This decorator is typically
 * used in conjunction with a `RolesGuard`.
 *
 * @param {...Role} roles - A list of `Role` enums that are allowed to access the decorated route handler or class.
 * @returns {<TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void}
 *   A NestJS decorator that attaches role metadata to the target.
 */
import { SetMetadata } from '@nestjs/common';
import { Role } from '@design-assets/db';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);