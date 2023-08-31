import { Body, Controller, Delete, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { DeductionsService } from "@organization/payroll/deductions/deductions.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { CreateDeductionsDto, DeductionDto, EditAllowanceDto, EditDeductionDto } from "@core/dto/global/Payroll.dto";
import { SearchRequest } from "@core/model/search-request";

@Controller("organization/payroll/deductions")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class DeductionsController extends BaseController {
  constructor(private readonly deductionService: DeductionsService) {
    super();
  }

  @Post("/:orgID/create")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async createAnDeduction(@Param("orgID") orgID: string,
                          @GetUser() payload: AuthPayload,
                          @Body(ValidationPipe) dto: CreateDeductionsDto
  ) {
    return this.response({ payload: await this.deductionService.createDeduction(dto, orgID, payload.email) });
  }

  @Post("/:orgID/allDeductions")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllDeductions(@Param("orgID") orgID: string,
                         @Body() searchRequest: SearchRequest) {
    return this.response({ payload: await this.deductionService.allDeductionsInOrg(orgID, searchRequest) });
  }

  @Get("/:orgID/deduction/:deductionID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getOneDeduction(@Param("orgID") orgID: string,
                        @Param("deductionID") deductionID: string
  ) {
    return this.response({ payload: await this.deductionService.getDeductionOneDeductionById(orgID, deductionID) });
  }

  @Post("/:orgID/deduction")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getDeductionByName(@Param("orgID") orgID: string,
                           @Body(ValidationPipe) dto: DeductionDto
  ) {
    return this.response({ payload: await this.deductionService.getDeductionByName(orgID, dto) });
  }


  @Post("/:orgID/deduction/edit/:deductionID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async editDeductions(@Param("orgID") orgID: string,
                      @Param("deductionID") deductionID: string,
                      @GetUser() payload: AuthPayload,
                      @Body(ValidationPipe) dto: EditDeductionDto
  ) {
    return this.response({ payload: await this.deductionService.editDeduction(dto, deductionID, orgID, payload.email) });
  }


  @Delete("/:orgID/deduction/delete/:deductionID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async deleteDeduction(@Param("orgID") orgID: string,
                        @Param("deductionID") deductionID: string,
                        @GetUser() payload: AuthPayload) {
    return this.response({ payload: await this.deductionService.deleteDeduction(orgID, deductionID, payload.email) });

  }
  //TODO edit deduction
  //TODO delete deduction

}
