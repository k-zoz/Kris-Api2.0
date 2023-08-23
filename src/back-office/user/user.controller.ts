import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { AuthService } from "@auth/service/auth.service";
import { AuthGuard } from "@nestjs/passport";
import {
  ConfirmInputPasswordDto,
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
import { UserService } from "@back-office/user/user.service";
import { SearchRequest } from "@core/model/search-request";
import { UserPrismaHelperService } from "@back-office/helper-services/user-prisma-helper.service";


@Controller("backoffice/users")
@UseGuards(AuthGuard())
@UseGuards(RolesGuard)
export class UserController extends BaseController {
  constructor(private readonly authService: AuthService,
              private readonly userService: UserService,
              private readonly userHelperService: UserPrismaHelperService
  ) {
    super();
  }

  @Get("roles")
  allRoles() {
    return this.response({ payload: this.userService.roles() });
  }

  @Get("status")
  allBoStatus() {
    return this.response({ payload: this.userService.boStatus() });
  }

  @Post("onboard")
  @Permission(UserRoleEnum.SUPER_ADMIN)
  async onboard(@GetUser() payload: AuthPayload,
                @Body(ValidationPipe) request: CreateSuperUserDto) {
    return this.response({
      payload: await this.userService.onboardBackOfficeUser(request, payload.email),
      status: HttpStatus.CREATED,
      message: "Account created successfully"
    });
  };


  @Post("changeRole/:userID")
  @Permission(UserRoleEnum.SUPER_ADMIN)
  async changeBackOfficeRole(@GetUser() payload: AuthPayload,
                             @Param("userID") userID: string,
                             @Body(ValidationPipe) request: UpdateBackOfficeUserRole) {
    return this.response({
      payload: await this.userService.changeUserRole(payload.email, userID, request.role),
      status: HttpStatus.OK,
      message: "Role successfully changed"
    });
  }

  @Post("confirmPassword/:userID")
  async confirmInputPassword(@Body(ValidationPipe) dto:ConfirmInputPasswordDto,
                             @Param("userID") userID: string,
  ){
    return this.response({payload: await this.userService.checkUserPassword(dto, userID)})
  }

  @Post("changePassword/:userID")
  async changeBackOfficePassword(@GetUser() payload: AuthPayload,
                                 @Param("userID") userID: string,
                                 @Body(ValidationPipe) request: UpdateBackOfficeUserPassword
  ) {
    return this.response({
      payload: await this.userService.changeUserPassword(payload.email, userID, request.password),
      status: HttpStatus.OK,
      message: "Password Changed"
    });
  }

  @Get("resetPassword/:userID")
  @Permission(UserRoleEnum.SUPER_ADMIN)
  async resetBackOfficePassword(@GetUser() payload: AuthPayload,
                                @Param("userID") userID: string
  ) {
    return this.response({
      payload: await this.userService.resetUserPassword(payload.email, userID),
      message: "Changes saved successfully"
    });
  }

  @Get("/:userID")
  async findUserByID(@Param("userID") userID: string) {
    return this.response({ payload: await this.userHelperService.findUserById(userID) });
  }

  @Post("/:userID/editProfile")
  // @Permission(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.STAFF, UserRoleEnum.SUPPORT)
  async updateProfile(@GetUser() payload: AuthPayload,
                      @Body(ValidationPipe) request: UpdateBackOfficeProfile,
                      @Param("userID") userID: string
  ) {
    return this.response({
      payload: await this.userService.editProfile(userID, request),
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

  @Post("userProfile")
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

