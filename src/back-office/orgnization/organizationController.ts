import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "@core/guard/roles.guard";
import { BaseController } from "@core/utils/base-controller.controller";
import { Permission } from "@core/decorator/roles.decorator";
import { UserRoleEnum } from "@core/enum/user-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { CreateOrgDto, EditOrgDto } from "@core/dto/global/organization.dto";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { SearchRequest } from "@core/model/search-request";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";

@Controller("backoffice/organization")
@UseGuards(AuthGuard())
@UseGuards(RolesGuard)
export class OrganizationController extends BaseController {
  constructor(private readonly organizationService: OrganizationService,
              private readonly orgHelperService: OrganizationPrismaHelperService,
              ) {
    super();
  }

  @Post("onboard")
  @Permission(UserRoleEnum.SUPPORT, UserRoleEnum.SUPER_ADMIN)
  async onboardOrganization(@GetUser() payload: AuthPayload,
                            @Body(ValidationPipe) request: CreateOrgDto
  ) {
    console.log(request);
    return this.response({
      message: "Created successfully",
      payload: await this.organizationService.onboardOrganization(request, payload.email),
      status: HttpStatus.CREATED
    });
  }

  @Post()
  @Permission(UserRoleEnum.SUPPORT, UserRoleEnum.SUPER_ADMIN)
  async allOrganizations(@Body(ValidationPipe) searchRequest: SearchRequest) {
    return this.response({ payload: await this.organizationService.findAllOrg(searchRequest) });
  }


  @Get("/:orgID")
  @Permission(UserRoleEnum.SUPPORT, UserRoleEnum.SUPER_ADMIN)
  async findOrgByID(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.orgHelperService.findOrgByID(orgID) });
  }


  @Post("edit/:orgID")
  @Permission(UserRoleEnum.SUPPORT, UserRoleEnum.SUPER_ADMIN)
  async updateOrg(@GetUser() payload: AuthPayload,
                  @Param("orgID") orgID: string,
                  @Body(ValidationPipe) request: EditOrgDto
  ) {
    return this.response({
      message: "Changes saved Successfully",
      payload: await this.organizationService.editOrganization(request, orgID, payload.email)
    });
  }



  // //Testing
  // @Get("onboarders")
  // @Permission(UserRoleEnum.SUPPORT, UserRoleEnum.SUPER_ADMIN)
  // async getOnboarders(@GetUser() payload: AuthPayload) {
  //   console.log(payload);
  // }
}
