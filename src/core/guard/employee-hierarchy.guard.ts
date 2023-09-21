import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { Reflector } from "@nestjs/core";
import { EmployeeHierarchyEnum } from "@core/enum/employee-role-enum";
import { EMP_HIERARCHY } from "@core/decorator/employee-hierarchy.decorator";
import { AppUnauthorizedException } from "@core/exception/app-exception";

@Injectable()
export class EmployeeHierarchyGuard implements CanActivate {
  constructor(private reflector: Reflector) {
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    //required role refer to what's inside the param decorator

    const requiredRoles = this.reflector.getAllAndOverride<EmployeeHierarchyEnum[]>(EMP_HIERARCHY, [
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
