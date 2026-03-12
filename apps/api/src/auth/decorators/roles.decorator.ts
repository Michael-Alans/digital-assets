import { SetMetadata } from '@nestjs/common';
import { Role } from '@design-assets/db';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);