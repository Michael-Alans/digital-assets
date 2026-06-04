import { SetMetadata } from '@nestjs/common';

/**
 * Key used to store metadata indicating whether a route is public.
 * @type {string}
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator that marks a route as public, bypassing authentication guards.
 *
 * When applied to a controller method or an entire controller,
 * it signals to authentication guards that this specific route
 * should not require authentication.
 *
 * @returns {MethodDecorator & PropertyDecorator} A decorator function that sets the `IS_PUBLIC_KEY` metadata to `true`.
 *
 * @example
 * ```typescript
 * @Public()
 * @Get('status')
 * getStatus() {
 *   return { status: 'ok' };
 * }
 * 
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);