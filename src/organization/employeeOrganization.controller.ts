import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmployeeOrganizationService } from "@organization/employeeOrganization.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { EditOrgDto, ModifyOrg } from "@core/dto/global/organization.dto";
import { SearchRequest } from "@core/model/search-request";
import { Permission } from "@core/decorator/roles.decorator";
import { UserRoleEnum } from "@core/enum/user-role-enum";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller("organization")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmployeeOrganizationController extends BaseController {
  constructor(private readonly employeeOrganizationService: EmployeeOrganizationService,
              private readonly organizationService: OrganizationService,
              ) {
    super();
  }


  @Get("/:orgID/information")
  async getOrgInfo(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.employeeOrganizationService.findOrgInfo(orgID) });
  }

  @Post("/:orgID/edit")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async updateOrg(@GetUser() payload: AuthPayload,
                  @Param("orgID") orgID: string,
                  @Body(ValidationPipe) request: EditOrgDto
  ) {
    return this.response({
      message: "Changes saved Successfully",
      payload: await this.organizationService.editOrganization(request, orgID, payload.email)
    });
  }

}
