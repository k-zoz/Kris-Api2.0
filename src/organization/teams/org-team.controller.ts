import { Body, Controller, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { OrgTeamService } from "@organization/teams/org-team.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { ModifyOrg } from "@core/dto/global/organization.dto";
import { SearchRequest } from "@core/model/search-request";

@Controller('organization/team')
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class OrgTeamController extends BaseController{
  constructor(private readonly orgTeamService:OrgTeamService) {
    super();
  }



  @Post("/:orgID/:deptID/addTeam")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addTeamToOrg(@Param("orgID") orgID: string,
                     @Param("deptID") deptID: string,
                     @Body(ValidationPipe) dto: ModifyOrg
  ) {
    return this.response({
      payload: await this.orgTeamService.addTeam(dto, orgID, deptID),
      message: "Added Successfully"
    });
  }


  // TODO get all teams
  @Post("/:orgID/allTeams")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllTeams(@Param("orgID") orgID: string,
                    @Body() searchRequest: SearchRequest
  ) {
    return this.response({ payload: await this.orgTeamService.allTeams(orgID, searchRequest) });
  }


// TODO get all team leads
  @Post("/:orgID/allTeamLeads")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllTeamLeads(@Param("orgID") orgID: string,
                        @Body() searchRequest: SearchRequest
  ) {
    return this.response({ payload: await this.orgTeamService.allTeamLeads(orgID, searchRequest) });
  }

}
