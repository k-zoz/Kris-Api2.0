import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { OrgTeamService } from "@organization/teams/org-team.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import {
  CreateTeamInDepartmentDto,
  DepartmentNameSearchDto,
  ModifyOrg,
  TeamLeadDto
} from "@core/dto/global/organization.dto";
import { SearchRequest } from "@core/model/search-request";
import { SkipThrottle } from "@nestjs/throttler";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";

@SkipThrottle()
@Controller("organization/team")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class OrgTeamController extends BaseController {
  constructor(private readonly orgTeamService: OrgTeamService) {
    super();
  }


  @Post("/:orgID/addTeam")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addTeamToDepartment(@Param("orgID") orgID: string,
                            @Body(ValidationPipe) dto: CreateTeamInDepartmentDto,
                            @GetUser() payload: AuthPayload
  ) {
    return this.response({
      payload: await this.orgTeamService.addTeam(dto, orgID, payload.email),
      message: "Added Successfully"
    });
  }


  @Post("/:orgID/allTeams")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllTeams(@Param("orgID") orgID: string,
                    @Body() searchRequest: SearchRequest
  ) {
    return this.response({ payload: await this.orgTeamService.allTeams(orgID, searchRequest) });
  }

  @Post("/:orgID/allTeamsInDepartment")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getTeamsInDepartment(@Param("orgID") orgID: string,
                             @Body() dto: DepartmentNameSearchDto
  ) {
    return this.response({ payload: await this.orgTeamService.allTeamsInDept(orgID, dto) });
  }

  @Post("/:orgID/allTeamLeads")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllTeamLeads(@Param("orgID") orgID: string,
                        @Body() searchRequest: SearchRequest
  ) {
    return this.response({ payload: await this.orgTeamService.allTeamLeads(orgID, searchRequest) });
  }

  @Get("/:orgID/allEmployeesInTeam/:teamID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async allEmployeesInATeam(@Param("orgID") orgID: string,
                            @Param("teamID") teamID: string
  ) {
    return this.response({ payload: await this.orgTeamService.allEmployeesInATeam(orgID, teamID) });
  }


  @Get("/:orgID/allEmployeesInMyTeam")
  async allEmployeesInMyTeam(@GetUser() payload: AuthPayload,
                             @Param("orgID") orgID: string
  ) {
    return this.response({ payload: await this.orgTeamService.allTeamMembers(orgID, payload.email) });
  }

  @Get("/:orgID/teamLead/:teamID/:empID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async makeEmployeeTeamLead(@Param("orgID") orgID: string,
                             @Param("teamID") teamID: string,
                             @Param("empID") empID: string
  ) {
    return this.response({ payload: await this.orgTeamService.employeeAsTeamLead(orgID, teamID, empID) });
  }

  @Post("/:orgID/teamLead/:teamID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async teamLead(@Param("orgID") orgID: string,
                 @Param("teamID") teamID: string,
                 @Body() dto: TeamLeadDto
  ) {
    return this.response({ payload: await this.orgTeamService.makeTeamLeadWithEmail(dto, orgID, teamID) });
  }


  @Get("/:orgID/teamLead/:teamID/:empID/remove")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async removeEmployeeAsTeamLead(@Param("orgID") orgID: string,
                                 @Param("teamID") teamID: string,
                                 @Param("empID") empID: string) {
    return this.response({ payload: await this.orgTeamService.removeEmployeeAsTeamLead(orgID, empID, teamID) });
  }


  // TODO remove team
  // TODO number of team and members

}
