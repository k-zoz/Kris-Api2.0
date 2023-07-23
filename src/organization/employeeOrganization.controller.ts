import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmployeeOrganizationService } from "@organization/employeeOrganization.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { ModifyOrg } from "@core/dto/global/organization.dto";

@Controller("organization")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmployeeOrganizationController extends BaseController {
  constructor(private readonly employeeOrganizationService: EmployeeOrganizationService) {
    super();
  }

  @Post("/:orgID/addDepartment")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addDeptToOrganization(@Param("orgID") orgID: string,
                              @GetUser() payload: AuthPayload,
                              @Body(ValidationPipe) dto: ModifyOrg
  ) {
    return this.response({
      message: "Added Successfully",
      payload: await this.employeeOrganizationService.addDepartments(dto, orgID)
    });
  }

  @Post("/:orgID/:deptID/addTeam")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addTeamsToOrg(@Param("orgID") orgID: string,
                      @Param("deptID") deptID: string,
                      @Body(ValidationPipe) dto: ModifyOrg
  ){
    return this.response({payload: await this.employeeOrganizationService.addTeams(dto, orgID, deptID)})
  }

  @Get("/:orgID/information")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getOrgInfo(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.employeeOrganizationService.findOrgInfo(orgID) });
  }



  // TODO add employe to team
  //TODO add team lead
  // remove team lead
  // remove dept
  // remove team
  // add emp to dept
  // add emp to team
  // get all departments
  // get all teams
  // get all team leads
}
