import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { OrgEmployeeService } from "@organization/orgEmployee/org-employee.service";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import {
  CreateEmployeeDto,
  EditEmployeeDto,
  EmployeeOnboardRequest, EmployeeUpdateRequest, EmployeeWork,

  RoleToEmployee, UpdateEmployeeWork
} from "@core/dto/global/employee.dto";
import { EmployeeService } from "@back-office/employee/employee.service";
import { AuthMsg } from "@core/const/security-msg-const";
import { Permission } from "@core/decorator/roles.decorator";
import { UserRoleEnum } from "@core/enum/user-role-enum";
import { SearchRequest } from "@core/model/search-request";
import { ConfirmInputPasswordDto } from "@core/dto/auth/user.dto";

@Controller("organization/employee")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class OrgEmployeeController extends BaseController {
  constructor(private readonly orgEmployeeService: OrgEmployeeService,
              private readonly employeeService: EmployeeService
  ) {
    super();
  }

  @Get("profile")
  employeeProfile(@GetUser() payload: AuthPayload) {
    return this.response({ payload });
  };

  @Get("roles")
  allRoles() {
    return this.response({ payload: this.orgEmployeeService.roles() });
  }

  @Get("status")
  allBoStatus() {
    return this.response({ payload: this.employeeService.empStatus() });
  }

  @Post("/:orgID/editProfile")
  async editMyProfile(
    @GetUser() payload: AuthPayload,
    @Param("orgID") orgID: string,
    @Body(ValidationPipe) request: EditEmployeeDto
  ) {
    return this.response({
      payload: await this.employeeService.editEmployeeProfile(request, orgID, payload)
    });
  }


  @Post("/:orgID/onboard")
  @EmpPermission(EmployeeRoleEnum.MANAGEMENT, EmployeeRoleEnum.HUMAN_RESOURCE)
  async onboardEmployeeToMyOrg(@GetUser() payload: AuthPayload,
                               @Param("orgID") orgID: string,
                               @Body(ValidationPipe) request: EmployeeOnboardRequest
  ) {
    return this.response({
      message: "Created Successfully",
      payload: await this.orgEmployeeService.onboardEmpToMyOrg(request, orgID, payload.email)
    });
  }


  @Post("/:orgID/updateWorkInfo/:empID")
  @EmpPermission(EmployeeRoleEnum.MANAGEMENT, EmployeeRoleEnum.HUMAN_RESOURCE)
  async updateEmployeeWorkInformation(@GetUser() payload: AuthPayload,
                                      @Param("orgID") orgID: string,
                                      @Param("empID") empID: string,
                                      @Body(ValidationPipe) dto: UpdateEmployeeWork
  ) {
    return this.response({ payload: await this.orgEmployeeService.updateEmployeeWorkInfo(dto, orgID, empID, payload.email) });
  }

  @Post("/:orgID/roles/:empID/changeRole")
  @EmpPermission(EmployeeRoleEnum.MANAGEMENT, EmployeeRoleEnum.HUMAN_RESOURCE)
  async changeEmployeeRole(@GetUser() payload: AuthPayload,
                           @Param("orgID") orgID: string,
                           @Param("empID") empID: string,
                           @Body(ValidationPipe) request: RoleToEmployee
  ) {
    return this.response({
      message: "Changes saved successfully",
      payload: await this.employeeService.changeEmployeeRole(request, orgID, empID, payload.email)
    });
  }

  @Post("/:orgID/roles/:empID/addRole")
  @EmpPermission(EmployeeRoleEnum.MANAGEMENT, EmployeeRoleEnum.HUMAN_RESOURCE)
  async addRolesToEmployee(@GetUser() payload: AuthPayload,
                           @Param("orgID") orgID: string,
                           @Param("empID") empID: string,
                           @Body(ValidationPipe) request: RoleToEmployee
  ) {
    return this.response({
      message: AuthMsg.ROLE_ADDED,
      payload: await this.employeeService.addMoreRolesToEmployee(request, orgID, empID, payload.email)
    });
  };


  @Post("/:orgID/roles/:empID/deleteRole")
  @Permission(UserRoleEnum.SUPPORT)
  async deleteRoleFromEmployee(@GetUser() payload: AuthPayload,
                               @Param("orgID") orgID: string,
                               @Param("empID") empID: string,
                               @Body(ValidationPipe) request: RoleToEmployee
  ) {
    return this.response({
      message: AuthMsg.ROLE_REMOVED_SUCCESSFULLY,
      payload: await this.employeeService.removeRoleFrmEmp(request, orgID, empID, payload.email)
    });
  };

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


  // @Post("/:orgID/:deptID/addTeamLead/:empID/:teamID")
  // @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  // async addTeamLead(@Param("orgID") orgID: string,
  //                   @Param("teamID") teamID: string,
  //                   @Param("empID") empID: string,
  //                   @Param("deptID") deptID: string
  // ) {
  //   return this.response({ payload: await this.orgEmployeeService.addEmployeeAsTeamLead(orgID, teamID, empID, deptID) });
  // }

  // @Post("/:orgID/:deptID/removeTeamLead/:empID/:teamID")
  // @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  // async removeTeamLead(@Param("orgID") orgID: string,
  //                      @Param("teamID") teamID: string,
  //                      @Param("empID") empID: string,
  //                      @Param("deptID") deptID: string
  // ) {
  //   return this.response({ payload: await this.orgEmployeeService.removeEmployeeAsTeamLead(orgID, teamID, empID, deptID) });
  // }

  @Post("/:orgID/allEmployees")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async allEmployeesInMyOrg(@Body(ValidationPipe) searchRequest: SearchRequest,
                            @Param("orgID") orgID: string
  ) {
    return this.response({
      payload: await this.employeeService.findAllEmployees(searchRequest, orgID)
    });
  };

  @Get("/:orgID/employee/:empID")
  // @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async findOneEmployee(@Param("orgID") orgID: string,
                        @Param("empID") empID: string
  ) {
    return this.response({ payload: await this.employeeService.findOneEmployee(orgID, empID) });
  }

  // TODO delete employee, delete from team, department, leave plans, e.t.c
  @Get("/:orgID/resetPassword/:empID")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE, EmployeeRoleEnum.MANAGEMENT)
  async resetPassword(@Param("orgID") orgID: string,
                      @Param("empID") empID: string,
                      @GetUser() payload: AuthPayload
  ) {
    return this.response({
      payload: await this.orgEmployeeService.resetEmployeePassword(orgID, empID, payload.email),
      message: "Changes saved successfully"
    });
  }


  @Post("changeMyPassword/:empID")
  async changeMyPassword(@GetUser() payload: AuthPayload,
                         @Body(ValidationPipe) dto: ConfirmInputPasswordDto,
                         @Param("empID") empID: string
  ) {
    return this.response({ payload: await this.orgEmployeeService.changeMyPassword(dto, payload.email) });
  }

  @Post("updateMyProfile")
  async updateMyProfile(@GetUser() payload: AuthPayload,
                        @Body() dto: EmployeeUpdateRequest
  ) {
    return this.response({ payload: await this.orgEmployeeService.updateMyProfile(dto, payload) });
  }

}
