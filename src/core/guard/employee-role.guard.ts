import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from "@nestjs/core";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { EMP_ROLE_KEY } from "@core/decorator/employee-role.decorator";

@Injectable()
export class EmployeeRoleGuard implements CanActivate {

  constructor(private reflector:Reflector) {
  }
  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<EmployeeRoleEnum[]>(EMP_ROLE_KEY,[
      context.getHandler(),
      context.getClass()
    ])

    //if there is no Emp role decorator on the controller, it means it's accessible to all
    if (!requiredRoles) {
      return true;
    }
  }
}
