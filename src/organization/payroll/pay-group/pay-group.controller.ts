import { Body, Controller, Delete, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { PayGroupService } from "@organization/payroll/pay-group/pay-group.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import {  CreatePayGroupDto, PayGroupDto } from "@core/dto/global/Payroll.dto";
import { SearchRequest } from "@core/model/search-request";

@Controller('organization/payroll/payGroup')
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class PayGroupController extends BaseController{
  constructor(private readonly payGroupService:PayGroupService) {
    super();
  }


  @Post("/:orgID/create")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async createAPayGroup(@Param("orgID") orgID: string,
                          @GetUser() payload: AuthPayload,
                          @Body(ValidationPipe) dto: CreatePayGroupDto
  ) {
    return this.response({ payload: await this.payGroupService.createPayGroup(dto, orgID, payload.email) });
  }

  @Post("/:orgID/allPayGroups")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async allPayGroups(@Param("orgID") orgID: string,
                         @Body() searchRequest: SearchRequest) {
    return this.response({ payload: await this.payGroupService.getPayGroups(orgID, searchRequest) });
  }


  @Get("/:orgID/payGroup/:payGroupID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getOnePayGroup(@Param("orgID") orgID: string,
                        @Param("payGroupID") payGroupID: string
  ) {
    return this.response({ payload: await this.payGroupService.getPayGroupById(orgID, payGroupID) });
  }


  @Post("/:orgID/payGroup")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getPayGroupByName(@Param("orgID") orgID: string,
                           @Body(ValidationPipe) dto: PayGroupDto
  ) {
    return this.response({ payload: await this.payGroupService.getPayGroupByName(orgID, dto) });
  }

  @Delete("/:orgID/payGroup/delete/:payGroupID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async deletePayGroup(@Param("orgID") orgID: string,
                        @Param("payGroupID") payGroupID: string,
                        @GetUser() payload: AuthPayload) {
    return this.response({ payload: await this.payGroupService.deletePayGroup(orgID, payGroupID, payload.email) });

  }

}
