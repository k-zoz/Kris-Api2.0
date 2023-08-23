import { Body, Controller, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { OrgTeamService } from "@organization/teams/org-team.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { CreateTeamInDepartmentDto, DepartmentNameSearchDto, ModifyOrg } from "@core/dto/global/organization.dto";
import { SearchRequest } from "@core/model/search-request";
import { SkipThrottle } from "@nestjs/throttler";

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
                            @Body(ValidationPipe) dto: CreateTeamInDepartmentDto
  ) {
    return this.response({
      payload: await this.orgTeamService.addTeam(dto, orgID),
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
                             @Body() dto: DepartmentNameSearchDto,

  ) {
    return this.response({ payload: await this.orgTeamService.allTeamsInDept(orgID, dto) });
  }

  // @Post("/:orgID/allTeamLeads")
  // @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  // async getAllTeamLeads(@Param("orgID") orgID: string,
  //                       @Body() searchRequest: SearchRequest
  // ) {
  //   return this.response({ payload: await this.orgTeamService.allTeamLeads(orgID, searchRequest) });
  // }

  // TODO remove team
  // TODO number of team and members

}
