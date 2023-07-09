import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { AuthService } from "@auth/service/auth.service";
import { AuthGuard } from "@nestjs/passport";
import {
  CreateSuperUserDto,
  UpdateBackOfficeProfile,
  UpdateBackOfficeUserPassword,
  UpdateBackOfficeUserRole
} from "@core/dto/auth/user-dto";
import { RolesGuard } from "@core/guard/roles.guard";
import { Permission } from "@core/decorator/roles.decorator";
import { GetUser } from "@auth/model/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload";
import { UserRoleEnum } from "@core/enum/user-role-enum";
import { UserService } from "@auth/user/user.service";

@Controller("users")
@UseGuards(AuthGuard())
@UseGuards(RolesGuard)
export class UserController extends BaseController {
  constructor(private readonly authService: AuthService,
              private readonly userService: UserService
  ) {
    super();
  }

  @Post("onboard")
  @Permission(UserRoleEnum.SUPER_ADMIN)
  async onboard(@GetUser() payload: AuthPayload,
                @Body(ValidationPipe) request: CreateSuperUserDto) {
    return super.response({
      payload: await this.authService.onboardBackOfficeUser(request, payload.email),
      status: HttpStatus.CREATED,
      message: "Account created successfully"
    });
  };


  @Post("updateRole/:email")
  @Permission(UserRoleEnum.SUPER_ADMIN)
  async updateBackOfficeRole(@GetUser() payload: AuthPayload,
                             @Param("email") email: string,
                             @Body(ValidationPipe) request: UpdateBackOfficeUserRole) {
    return super.response({
      payload: await this.userService.changeUserRole(payload.email, email, request.role),
      status: HttpStatus.OK,
      message: "Role successfully changed"
    });
  }

  @Post("updatePassword/:email")
  @Permission(UserRoleEnum.SUPER_ADMIN)
  async updateBackOfficePassword(@GetUser() payload: AuthPayload,
                                 @Param("email") email: string,
                                 @Body(ValidationPipe) request: UpdateBackOfficeUserPassword
  ) {
    return super.response({
      payload: await this.userService.changeUserPassword(payload.email, email, request.password),
      status:HttpStatus.OK,
      message:"Password Changed"
    })
  }

  @Post("updateProfile")
  @Permission(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.STAFF, UserRoleEnum.SUPPORT)
  async updateProfile(@GetUser() payload:AuthPayload,
                      @Body(ValidationPipe) request:UpdateBackOfficeProfile
  ){
    return super.response({
      payload:await this.userService.updateProfile(payload.email,request),
      status:HttpStatus.OK,
      message: "Profile Updated"
    })
  }

  //Testing
  @Get("onboarders")
  @Permission(UserRoleEnum.STAFF)
  async getOnboarders(@GetUser() payload: AuthPayload) {
    console.log(payload);
  }
}

