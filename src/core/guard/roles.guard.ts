import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { connect, Observable } from "rxjs";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { ROLE_KEY } from "@core/decorator/roles.decorator";
import { AppTokenExpiredException, AppUnauthorizedException } from "@core/exception/app-exception";
import { UserRoleEnum } from "@core/enum/user-role-enum";

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private reflector: Reflector) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    //if there is no role decorator on the controller, it means it's accessible to all
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
