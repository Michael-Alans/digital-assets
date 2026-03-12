import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
   const request = context.switchToHttp().getRequest();
  const authHeader = request.headers.authorization;

  console.log('--- Auth Guard Check ---');
  console.log('Authorization Header present:', !!authHeader);

   const token = authHeader?.split(' ')[1];
  if (!token) {
    console.log('❌ No token found in request');
    throw new UnauthorizedException();
  }

    try {
  console.log('--- Verifying Token ---');
  console.log('Secret Key exists:', !!process.env.CLERK_SECRET_KEY);
  const decoded = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  console.log('✅ Token Verified for:', decoded.sub);

  console.log('--- Syncing User ---');
  const user = await this.usersService.syncUser(decoded.sub);
console.log('✅ User Synced:', user.id);

// Explicitly spread the user and add 'sub'
request.user = { 
  ...user, 
  sub: decoded.sub 
}; 

return true;
} catch (e) {
  console.error('❌ Guard Error:', e.message); // This will tell us if it's Clerk or Prisma
  throw new UnauthorizedException();
}
  }
}