import { Body, Controller, Get, HttpStatus, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { AuthService } from "@auth/service/auth.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateSuperUserDto } from "@core/dto/auth/user-dto";
import { RolesGuard } from "@core/guard/roles.guard";
import { Permission } from "@core/decorator/roles.decorator";
import { GetUser } from "@auth/model/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload";
import { UserRoleEnum } from "@core/enum/user-role-enum";

@Controller("users")
@UseGuards(AuthGuard())
@UseGuards(RolesGuard)
export class UserController extends BaseController {
  constructor(private readonly authService: AuthService
  ) {
    super();
  }

  @Post("/:backOfficeID/onboard")
  @Permission(UserRoleEnum.SUPER_ADMIN)
  async onboard(@GetUser() payload: AuthPayload,
                @Body(new ValidationPipe()) request: CreateSuperUserDto) {
    return super.response({
      payload: await this.authService.onboardBackOfficeUser(request, payload),
      status: HttpStatus.CREATED,
      message: "Account created successfully"
    });
  };

  //Testing
  @Get("onboarders")
  @Permission(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.STAFF)
  async getOnboarders(@GetUser() payload: AuthPayload) {
    console.log(payload);
  }
}

