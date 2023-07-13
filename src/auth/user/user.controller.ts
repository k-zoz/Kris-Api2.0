import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { AuthService } from "@auth/service/auth.service";
import { AuthGuard } from "@nestjs/passport";
import {
  CreateSuperUserDto,
  UpdateBackOfficeProfile,
  UpdateBackOfficeUserPassword,
  UpdateBackOfficeUserRole
} from "@core/dto/auth/user.dto";
import { RolesGuard } from "@core/guard/roles.guard";
import { Permission } from "@core/decorator/roles.decorator";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { UserRoleEnum } from "@core/enum/user-role-enum";
import { UserService } from "@auth/user/user.service";
import { SearchRequest } from "@core/model/search-request";


@Controller("users")
@UseGuards(AuthGuard())
@UseGuards(RolesGuard)
export class UserController extends BaseController {
  constructor(private readonly authService: AuthService,
              private readonly userService: UserService,
  ) {
    super();
  }

  @Get("roles")
  @Permission(UserRoleEnum.SUPER_ADMIN)
  allRoles() {
    return this.response({ payload: this.userService.roles() });
  }

  @Post("onboard")
  @Permission(UserRoleEnum.SUPER_ADMIN)
  async onboard(@GetUser() payload: AuthPayload,
                @Body(ValidationPipe) request: CreateSuperUserDto) {
    return this.response({
      payload: await this.authService.onboardBackOfficeUser(request, payload.email),
      status: HttpStatus.CREATED,
      message: "Account created successfully"
    });
  };


  @Post("changeRole/:ID")
  @Permission(UserRoleEnum.SUPER_ADMIN)
  async changeBackOfficeRole(@GetUser() payload: AuthPayload,
                             @Param("ID") id: string,
                             @Body(ValidationPipe) request: UpdateBackOfficeUserRole) {
    return this.response({
      payload: await this.userService.changeUserRole(payload.email, id, request.role),
      status: HttpStatus.OK,
      message: "Role successfully changed"
    });
  }

  @Post("changePassword/:ID")
  @Permission(UserRoleEnum.SUPER_ADMIN)
  async changeBackOfficePassword(@GetUser() payload: AuthPayload,
                                 @Param("ID") id: string,
                                 @Body(ValidationPipe) request: UpdateBackOfficeUserPassword
  ) {
    return this.response({
      payload: await this.userService.changeUserPassword(payload.email, id, request.password),
      status: HttpStatus.OK,
      message: "Password Changed"
    });
  }

  @Get("/:ID")
  async findUserByID(@Param("ID") id: string) {
    return this.response({ payload: await this.userService.findUserById(id) });
  }

  @Post("editProfile")
  // @Permission(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.STAFF, UserRoleEnum.SUPPORT)
  async updateProfile(@GetUser() payload: AuthPayload,
                      @Body(ValidationPipe) request: UpdateBackOfficeProfile
  ) {
    return this.response({
      payload: await this.userService.editProfile(payload.email, request),
      status: HttpStatus.OK,
      message: "Changes saved successfully"
    });
  }

  @Post()
  @Permission(UserRoleEnum.SUPER_ADMIN)
  async allUsers(@Body(ValidationPipe) searchRequest: SearchRequest) {
    return this.response({
      payload: await this.userService.findAllUsers(searchRequest)
    });

  }

  @Get("userProfile")
  userProfile(@GetUser() payload: AuthPayload) {
    return this.response({ payload });
  }


  // //Testing
  // @Get("onboarders")
  // @Permission(UserRoleEnum.STAFF)
  // async getOnboarders(@GetUser() payload: AuthPayload) {
  //   console.log(payload);
  // }
}

