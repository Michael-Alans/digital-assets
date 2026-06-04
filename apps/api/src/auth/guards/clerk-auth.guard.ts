import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // 👈 Import Reflector
import { verifyToken } from '@clerk/backend';
import { UsersService } from '../../users/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * @typedef {import('@nestjs/common').CanActivate} CanActivate
 * @typedef {import('@nestjs/common').ExecutionContext} ExecutionContext
 * @typedef {import('@nestjs/core').Reflector} Reflector
 * @typedef {import('../../users/users.service').UsersService} UsersService
 */

/**
 * An authentication guard that uses Clerk for token verification.
 *
 * This guard checks for a Clerk JWT in the `Authorization` header.
 * If a token is present and valid, it verifies it with Clerk,
 * syncs the user with the application's user service, and attaches
 * the user information to the request object.
 *
 * It also respects the `@Public()` decorator, allowing routes to bypass
 * authentication, even if a token is absent or invalid.
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  /**
   * Creates an instance of ClerkAuthGuard.
   * @param {UsersService} usersService - The service for managing user data.
   * @param {Reflector} reflector - The Reflector service to access metadata.
   */
  constructor(
    private usersService: UsersService,
    private reflector: Reflector, // 👈 Inject Reflector
  ) {}

  /**
   * Determines if the current request should be allowed to proceed.
   *
   * This method performs the following steps:
   * 1. Checks if the route is marked with the `@Public()` decorator.
   * 2. Extracts the JWT from the `Authorization` header.
   * 3. If no token is found:
   *    - If the route is public, allows access (guest).
   *    - Otherwise, throws an `UnauthorizedException`.
   * 4. If a token is found, verifies it using Clerk.
   * 5. If verification is successful, syncs the user with the database and
   *    attaches the user object to the request.
   * 6. If token verification fails:
   *    - If the route is public, allows access (guest).
   *    - Otherwise, throws an `UnauthorizedException`.
   *
   * @param {ExecutionContext} context - The current execution context.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the request is allowed,
   *   or throws an `UnauthorizedException` otherwise.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Check if the route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      if (isPublic) {
        console.log('ℹ️ Guest access granted to public route');
        return true; // Let them through without a user object
      }
      console.log('❌ No token found in request');
      throw new UnauthorizedException();
    }

    try {
      const decoded = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const user = await this.usersService.syncUser(decoded.sub);

      request.user = { 
        ...user, 
        sub: decoded.sub 
      }; 

      return true;
    } catch (e) {
      console.error('❌ Guard Error:', e.message);
      
      // If the token is invalid but the route is public, still let them in as a guest
      if (isPublic) {
        console.log('ℹ️ Invalid token, but route is public. Proceeding as guest.');
        return true;
      }
      
      throw new UnauthorizedException();
    }
  }
}