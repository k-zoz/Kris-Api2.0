import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from "@nestjs/core";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { EMP_ROLE_KEY } from "@core/decorator/employee-role.decorator";
import { AppUnauthorizedException } from "@core/exception/app-exception";

@Injectable()
export class EmployeeRoleGuard implements CanActivate {

  constructor(private reflector:Reflector) {
  }
  canActivate(context: ExecutionContext) {
    //required role refer to what's inside the param decorator
    const requiredRoles = this.reflector.getAllAndOverride<EmployeeRoleEnum[]>(EMP_ROLE_KEY,[
      context.getHandler(),
      context.getClass()
    ])

    //if there is no Emp role decorator on the controller, it means it's accessible to all
    if (!requiredRoles) {
      return true;
    }

    // from the payload, the signed user's mail and role saved on the request, it is then payload is cross-checked
    const user = context.switchToHttp().getRequest().authPayload;
    if (requiredRoles.some((role) => user.role?.includes(role))) {
      // User has at least one of the required roles
      return true;
    } else {
      throw new AppUnauthorizedException("You are not authorized to take this action");
    }

  }
}
