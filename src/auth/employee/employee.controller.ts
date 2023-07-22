import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmployeeService } from "@auth/employee/employee.service";
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
import { LocaleService } from "@locale/locale.service";
import { SearchRequest } from "@core/model/search-request";
import { AuthMsg } from "@core/const/security-msg-const";


@Controller("employee")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmployeeController extends BaseController {
  constructor(private readonly employeeService: EmployeeService,
              private readonly localeService: LocaleService
  ) {
    super();
  }


  @Post("/:orgID/onboard")
  @EmpPermission(EmployeeRoleEnum.MANAGEMENT, EmployeeRoleEnum.HUMAN_RESOURCE)
  async onboard(@GetUser() payload: AuthPayload,
                @Param("orgID") orgID: string,
                @Body(ValidationPipe) request: CreateEmployeeDto
  ) {
    return this.response({
      message: "Created Successfully",
      payload: await this.employeeService.onboardEmp(request, orgID, payload.email)
    });
  }


  @Post("/:orgID/profile/:empID/changeRole")
  @EmpPermission(EmployeeRoleEnum.MANAGEMENT)
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

  @Post("/:orgID/profile/:empID/addRole")
  @EmpPermission(EmployeeRoleEnum.MANAGEMENT)
  async addRoleToEmployee(@GetUser() payload: AuthPayload,
                          @Param("orgID") orgID: string,
                          @Param("empID") empID: string,
                          @Body(ValidationPipe) request: RoleToEmployee
  ) {
    return this.response({
      message: AuthMsg.ROLE_ADDED,
      payload: await this.employeeService.addMoreRolesToEmployee(request, orgID, empID, payload.email)
    });
  };

  @Post("/:orgID/profile/:empID/deleteRole")
  @EmpPermission(EmployeeRoleEnum.MANAGEMENT)
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


  @Get("profile")
  employeeProfile(@GetUser() payload: AuthPayload) {
    return this.response({ payload });
  };


  @Post("/:orgID/allEmployees")
  @EmpPermission(EmployeeRoleEnum.MANAGEMENT)
  async allEmployees(@Body(ValidationPipe) searchRequest: SearchRequest,
                     @Param("orgID") orgID: string
  ) {
    return this.response({
      payload: await this.employeeService.findAllEmployees(searchRequest, orgID)
    });
  };

  @Post("/:orgID/editProfile")
  async editProfile(
                    @GetUser() payload:AuthPayload,
                    @Param("orgID") orgID: string,
                    @Body(ValidationPipe) request: EditEmployeeDto
  ){
    return this.response({
      payload:await this.employeeService.editEmployeeProfile(request, orgID, payload)
    })
  }

  //Testing
  @Get("onboarders")
  @EmpPermission(EmployeeRoleEnum.HUMAN_RESOURCE)
  async getOnboarders(@GetUser() payload: any) {
    console.log(payload);
    // return this.response({ message: AuthMsg.CANNOT_CREATE_EMPLOYEE_WITH_MANAGEMENT_ROLE });
  }

}
