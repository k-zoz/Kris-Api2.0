import { Body, Controller, HttpStatus, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { UserService } from "@auth/user/user.service";
import { AuthService } from "@auth/service/auth.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateSuperUserDto } from "@core/dto/auth/user-dto";

@Controller("users")
@UseGuards(AuthGuard())
export class UserController extends BaseController {
  constructor(private readonly authService: AuthService
  ) {
    super();
  }

  @Post("onboard")
  async onboard(@Body(new ValidationPipe()) request:CreateSuperUserDto) {
    return super.response({
      payload: await this.authService.onboardBackOfficeUser(request),
      status: HttpStatus.CREATED,
      message: "Account created successfully"
    });
  }
}
