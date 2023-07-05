import { Body, Controller, Post } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { AuthService } from "@auth/service/auth.service";
import { LoginRequest } from "@auth/model/login-request";


@Controller("auth")
export class AuthController extends BaseController {

  constructor(
    private readonly authService: AuthService
  ) {
    super();
  }

  @Post("login")
  async login(@Body() request: LoginRequest) {
    return super.response({
      payload: await this.authService.backOfficeLogin(request),
      message: `Login Successful`
    });
  }
}
