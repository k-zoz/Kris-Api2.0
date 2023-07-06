import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { connect, Observable } from "rxjs";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { ROLE_KEY } from "@core/decorator/roles.decorator";
import { AppTokenExpiredException } from "@core/exception/app-exception";
import { UserRoleEnum } from "@core/enum/user-role-enum";

@Injectable()
export class RolesGuard extends AuthGuard() implements CanActivate {

  constructor(private reflector: Reflector) {
    super();
  }


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const auth = await super.canActivate(context);
    //if there is no token in the request
    if (!auth) {
      return false;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    console.log(requiredRoles);
    //if there is no role decorator on the controller, it means it's accessible to all
    if (!requiredRoles) {
      return true;
    }
  // from the payload, the signed user's mail and role saved on the request, it is the payload is cross-checked
    const user = context.switchToHttp().getRequest().user;
    return requiredRoles.some((impRole) => user.role?.includes(impRole));

  }
}
