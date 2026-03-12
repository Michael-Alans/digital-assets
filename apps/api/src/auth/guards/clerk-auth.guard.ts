import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // 👈 Import Reflector
import { verifyToken } from '@clerk/backend';
import { UsersService } from '../../users/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private reflector: Reflector, // 👈 Inject Reflector
  ) {}

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