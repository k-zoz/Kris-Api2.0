import { Body, Controller, Delete, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { AllowancesService } from "@organization/payroll/allowances/allowances.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { AllowanceDto, CreateAllowanceDto, EditAllowanceDto } from "@core/dto/global/Payroll.dto";
import { SearchRequest } from "@core/model/search-request";

@Controller("organization/payroll/allowance")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class AllowancesController extends BaseController {
  constructor(private readonly allowanceService: AllowancesService) {
    super();
  }


  @Post("/:orgID/create")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async createAnAllowance(@Param("orgID") orgID: string,
                          @GetUser() payload: AuthPayload,
                          @Body(ValidationPipe) dto: CreateAllowanceDto
  ) {
    return this.response({ payload: await this.allowanceService.createAllowance(dto, orgID, payload.email) });
  }

  @Post("/:orgID/allAllowances")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllAllowances(@Param("orgID") orgID: string,
                         @Body() searchRequest: SearchRequest) {
    return this.response({ payload: await this.allowanceService.allAllowancesInOrg(orgID, searchRequest) });
  }

  @Get("/:orgID/allowance/:allowanceID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getOneAllowance(@Param("orgID") orgID: string,
                        @Param("allowanceID") allowanceID: string
  ) {
    return this.response({ payload: await this.allowanceService.getAllowanceOneAllowanceById(orgID, allowanceID) });
  }

  @Post("/:orgID/allowance")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllowanceByName(@Param("orgID") orgID: string,
                           @Body(ValidationPipe) dto: AllowanceDto
  ) {
    return this.response({ payload: await this.allowanceService.getAlllowanceByName(orgID, dto) });
  }


  @Post("/:orgID/allowance/edit/:allowanceID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async editAllowance(@Param("orgID") orgID: string,
                      @Param("allowanceID") allowanceID: string,
                      @GetUser() payload: AuthPayload,
                      @Body(ValidationPipe) dto: EditAllowanceDto
  ) {
    return this.response({ payload: await this.allowanceService.editAllowance(dto, allowanceID, orgID, payload.email) });
  }


  @Delete("/:orgID/allowance/delete/:allowanceID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async deleteAllowance(@Param("orgID") orgID: string,
                        @Param("allowanceID") allowanceID: string,
                        @GetUser() payload: AuthPayload) {
    return this.response({ payload: await this.allowanceService.deleteAllowance(orgID, allowanceID, payload.email) });

  }
}
