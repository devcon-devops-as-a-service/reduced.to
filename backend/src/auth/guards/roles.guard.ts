import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../shared/decorators/roles/roles.decorator';
import { UserContext } from '../interfaces/user-context';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserContext;

    if (!user || !matchRoles(roles, user.role)) {
      return false;
    }

    return true;
  }
}

const matchRoles = (rolesArray: Role[], userRole: Role) => {
  return rolesArray.includes(userRole);
};
