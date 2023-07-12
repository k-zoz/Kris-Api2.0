import { Body, Controller, Post } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmployeeAuthService } from "@auth/service/employee-auth.service";
import { LoginRequest } from "@auth/model/login-request";

@Controller('employee')
export class EmployeeAuthController extends BaseController{
  constructor(private readonly employeeAuthService:EmployeeAuthService) {
    super();
  }

  @Post("login")
  async login(@Body() request:LoginRequest){
    return this.response({
      payload: await this.employeeAuthService.employeeLogin(request),
      message:`Login Successful`
    })
  }


}
