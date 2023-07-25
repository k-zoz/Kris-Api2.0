import { Body, Controller, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { OrgEmployeeService } from "@organization/orgEmployee/org-employee.service";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { CreateEmployeeDto } from "@core/dto/global/employee.dto";
import { EmployeeService } from "@back-office/employee/employee.service";
import { Permission } from "@core/decorator/roles.decorator";
import { UserRoleEnum } from "@core/enum/user-role-enum";

@Controller('organization/employee')
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class OrgEmployeeController extends BaseController{
  constructor(private readonly orgEmployeeService:OrgEmployeeService,
              private readonly employeeService: EmployeeService
              ) {
    super();
  }


  @Post("/:orgID/onboard")
  @EmpPermission(EmployeeRoleEnum.MANAGEMENT, EmployeeRoleEnum.HUMAN_RESOURCE)
  async onboardEmployeeToMyOrg(@GetUser() payload: AuthPayload,
                @Param("orgID") orgID: string,
                @Body(ValidationPipe) request: CreateEmployeeDto
  ) {
    return this.response({
      message: "Created Successfully",
      payload: await this.orgEmployeeService.onboardEmpToMyOrg(request, orgID, payload.email)
    });
  }

  @Post("/:orgID/:deptID/addEmployeeToDept/:empID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async addEmpTpDepartment(@Param("deptID") deptID: string,
                           @Param("orgID") orgID: string,
                           @Param("empID") empID: string
  ) {
    return this.response({
      payload: await this.orgEmployeeService.addEmpToDept(deptID, orgID, empID),
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
      payload: await this.orgEmployeeService.addEmployeeToATeam(orgID, teamID, empID, deptID),
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
    return this.response({ payload: await this.orgEmployeeService.addEmployeeAsTeamLead(orgID, teamID, empID, deptID) });
  }

  @Post("/:orgID/:deptID/removeTeamLead/:empID/:teamID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async removeTeamLead(@Param("orgID") orgID: string,
                       @Param("teamID") teamID: string,
                       @Param("empID") empID: string,
                       @Param("deptID") deptID: string
  ) {
    return this.response({ payload: await this.orgEmployeeService.removeEmployeeAsTeamLead(orgID, teamID, empID, deptID) });

  }


}
