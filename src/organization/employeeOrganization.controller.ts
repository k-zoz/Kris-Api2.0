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
      payload: await this.employeeOrganizationService.addDepartment(dto, orgID)
    });
  }

  @Post("/:orgID/:deptID/addEmployeeToDept/:empID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addEmpTpDepartment(@Param("deptID") deptID: string,
                           @Param("orgID") orgID: string,
                           @Param("empID") empID: string
  ) {
    return this.response({
      payload: await this.employeeOrganizationService.addEmpToDept(deptID, orgID, empID),
      message: "Added Successfully"
    });
  }

  @Post("/:orgID/:deptID/addTeam")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addTeamToOrg(@Param("orgID") orgID: string,
                     @Param("deptID") deptID: string,
                     @Body(ValidationPipe) dto: ModifyOrg
  ) {
    return this.response({
      payload: await this.employeeOrganizationService.addTeam(dto, orgID, deptID),
      message: "Added Successfully"
    });
  }

  @Post("/:orgID/:teamID/:deptID/addEmployee/:empID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addEmpToTeam(@Param("orgID") orgID: string,
                     @Param("teamID") teamID: string,
                     @Param("empID") empID: string,
                     @Param("deptID") deptID: string
  ) {
    return this.response({
      payload: await this.employeeOrganizationService.addEmployeeToATeam(orgID, teamID, empID, deptID),
      message: "Added Successfully"
    });

  }

  @Post("/:orgID/:deptID/addTeamLead/:empID/:teamID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addTeamLead(@Param("orgID") orgID: string,
                    @Param("teamID") teamID: string,
                    @Param("empID") empID: string,
                    @Param("deptID") deptID: string
  ) {
    return this.response({ payload: await this.employeeOrganizationService.addEmployeeAsTeamLead(orgID, teamID, empID, deptID) });

  }

  @Get("/:orgID/information")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getOrgInfo(@Param("orgID") orgID: string) {
    return this.response({ payload: await this.employeeOrganizationService.findOrgInfo(orgID) });
  }


  // TODO
  // TODO remove team lead
  // TODO remove dept
  // TODO remove team
  // TODO get all departments
  // TODO get all teams
  // TODO get all team leads
  // TODO number of team and members
  // TODO number of departments and teams in a department
  // TODO delete employee leave
}
