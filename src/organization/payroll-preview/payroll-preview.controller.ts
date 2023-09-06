import { Body, Controller, Delete, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { PayrollPreviewService } from "@organization/payroll-preview/payroll-preview.service";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { CreatePayrollPreviewDto, EmployeePayrollPreviewDto } from "@core/dto/global/Payroll.dto";
import { SearchRequest } from "@core/model/search-request";
import { Employee } from "@core/dto/global/employee.dto";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller("organization/payrollPreview")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class PayrollPreviewController extends BaseController {
  constructor(private readonly payrollPreviewService: PayrollPreviewService) {
    super();
  }

  @Post("/:orgID/create")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async createPayrollPP(@Param("orgID") orgID: string,
                        @GetUser() payload: AuthPayload,
                        @Body(ValidationPipe) dto: CreatePayrollPreviewDto
  ) {
    return this.response({ payload: await this.payrollPreviewService.createPayrollPreview(dto, orgID, payload.email) });
  }

  @Post("/:orgID/allPreviews")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async allPayrollPreviews(@Param("orgID") orgID: string,
                           @Body() searchRequest: SearchRequest) {
    return this.response({ payload: await this.payrollPreviewService.allPayrollPreview(orgID, searchRequest) });
  }

  @Post("/:orgID/payrollPreview/:payrollPreviewID/addEmployee")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async addEmployeeToPayRollPP(@Param("orgID") orgID: string,
                               @Param("payrollPreviewID") payrollPreviewID: string,
                               @GetUser() payload: AuthPayload,
                               @Body() dto: Employee
  ) {
    return this.response({ payload: await this.payrollPreviewService.addEmployeeToPayrollPreview(dto, orgID, payrollPreviewID, payload.email) });
  }

  @Post("/:orgID/payrollPreview/:payrollPreviewID/removeEmployee")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async removeEmployeeFromPayrollPreview(@Param("orgID") orgID: string,
                                         @Param("payrollPreviewID") payrollPreviewID: string,
                                         @GetUser() payload: AuthPayload,
                                         @Body() dto: Employee) {
    return this.response({ payload: await this.payrollPreviewService.removeEmployeeFromPayrollPreview(dto, orgID, payrollPreviewID, payload.email) });
  }

  @Get("/:orgID/payrollPreview/:payrollPreviewID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getOnePayrollPreview(@Param("orgID") orgID: string,
                             @Param("payrollPreviewID") payrollPreviewID: string,
                             @GetUser() payload: AuthPayload) {
    return this.response({ payload: await this.payrollPreviewService.getOnePayrollPreviewById(orgID, payrollPreviewID) });
  }


  @Post("/:orgID/payrollPreview/:payrollPreviewID/updateEmployeePayrollPreviewInfo/:empID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async updateEmployeeDataInPayrollPreview(@Param("orgID") orgID: string,
                                           @Param("payrollPreviewID") payrollPreviewID: string,
                                           @Param("empID") empID: string,
                                           @GetUser() payload: AuthPayload,
                                           @Body() dto: EmployeePayrollPreviewDto
  ) {
    return this.response({ payload: await this.payrollPreviewService.updateEmployeePayrollPreviewInformation(dto, orgID, payrollPreviewID, empID, payload.email) });
  }

  @Delete("/:orgID/payrollPreview/:payrollPreviewID/deleteEmployeesPayrollPreviewInfo/:empID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async deleteEmployeesFromPayroll(@Param("orgID") orgID: string,
                                   @Param("payrollPreviewID") payrollPreviewID: string,
                                   @Param("empID") empID: string,
                                   @GetUser() payload: AuthPayload
  ) {
    return this.response({ payload: await this.payrollPreviewService.deleteEmployeesFromPayrollPreview(orgID, payrollPreviewID, empID, payload.email) });
  }
}
