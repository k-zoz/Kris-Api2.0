import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmployeeService } from "@back-office/employee/employee.service";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import {
  CreateEmployeeDto, EditEmployeeDto,
  RoleToEmployee
} from "@core/dto/global/employee.dto";
import { SearchRequest } from "@core/model/search-request";
import { AuthMsg } from "@core/const/security-msg-const";
import { Permission } from "@core/decorator/roles.decorator";
import { UserRoleEnum } from "@core/enum/user-role-enum";
import { OrganizationService } from "@back-office/orgnization/organization.service";


@Controller("backoffice/employee")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmployeeController extends BaseController {
  constructor(private readonly employeeService: EmployeeService
  ) {
    super();
  }

  @Post("onboard/:orgID/employee")
  @Permission(UserRoleEnum.SUPPORT)
  async onboardOrgMgtEmployee(@GetUser() payload: AuthPayload,
                              @Param("orgID") orgID: string,
                              @Body(ValidationPipe) request: CreateEmployeeDto
  ) {
    return this.response({
      message: "Created successfully",
      status: HttpStatus.CREATED,
      payload: await this.employeeService.createOrgMgtEmployee(request, orgID, payload.email)
    });
  }


  @Post("/:orgID/roles/:empID/changeRole")
  @Permission(UserRoleEnum.SUPPORT)
  async changeOrgMgtEmployeeRole(@GetUser() payload: AuthPayload,
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
  @Permission(UserRoleEnum.SUPPORT)
  async addRolesToOrgMgtEmployee(@GetUser() payload: AuthPayload,
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
  async deleteRoleFromOrgMgtEmployee(@GetUser() payload: AuthPayload,
                                     @Param("orgID") orgID: string,
                                     @Param("empID") empID: string,
                                     @Body(ValidationPipe) request: RoleToEmployee
  ) {
    return this.response({
      message: AuthMsg.ROLE_REMOVED_SUCCESSFULLY,
      payload: await this.employeeService.removeRoleFrmEmp(request, orgID, empID, payload.email)
    });
  };


  @Post("/:orgID/allEmployees")
  @Permission(UserRoleEnum.SUPPORT)
  async allEmployeesInOrg(@Body(ValidationPipe) searchRequest: SearchRequest,
                          @Param("orgID") orgID: string
  ) {
    return this.response({
      payload: await this.employeeService.findAllEmployees(searchRequest, orgID)
    });
  };


  //Testing
  // @Get("onboarders")
  // @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE)
  // async getOnboarders(@GetUser() payload: any) {
  //   console.log(payload);
  //   // return this.response({ message: AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE });
  // }

}
