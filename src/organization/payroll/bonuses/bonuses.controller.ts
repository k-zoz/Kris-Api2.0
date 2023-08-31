import { Body, Controller, Delete, Get, Param, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { BonusesService } from "@organization/payroll/bonuses/bonuses.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { BonusDto, CreateBonusDto, EditBonusDto } from "@core/dto/global/Payroll.dto";
import { SearchRequest } from "@core/model/search-request";

@Controller("organization/payroll/bonuses")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class BonusesController extends BaseController {
  constructor(private readonly bonusService: BonusesService) {
    super();
  }

  @Post("/:orgID/create")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async createBonus(@Param("orgID") orgID: string,
                    @GetUser() payload: AuthPayload,
                    @Body(ValidationPipe) dto: CreateBonusDto
  ) {
    return this.response({ payload: await this.bonusService.createABonus(dto, orgID, payload.email) });
  }

  @Post("/:orgID/allBonuses")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getAllBonuses(@Param("orgID") orgID: string,
                      @Body() searchRequest: SearchRequest) {
    return this.response({ payload: await this.bonusService.getAllBonuses(orgID, searchRequest) });
  }

  @Get("/:orgID/bonus/:bonusID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getOneBonus(@Param("orgID") orgID: string,
                    @Param("bonusID") bonusID: string
  ) {
    return this.response({ payload: await this.bonusService.getBonusById(orgID, bonusID) });
  }

  @Post("/:orgID/bonus")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getBonusByName(@Param("orgID") orgID: string,
                       @Body(ValidationPipe) dto: BonusDto
  ) {
    return this.response({ payload: await this.bonusService.getBonusByName(orgID, dto) });
  }

  @Post("/:orgID/bonus/edit/:bonusID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async editBonus(@Param("orgID") orgID: string,
                  @Param("bonusID") bonusID: string,
                  @GetUser() payload: AuthPayload,
                  @Body(ValidationPipe) dto: EditBonusDto
  ) {
    return this.response({ payload: await this.bonusService.editBonus(dto, bonusID, orgID, payload.email) });
  }

  @Delete("/:orgID/bonus/delete/:bonusID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async deleteBonus(@Param("orgID") orgID: string,
                        @Param("bonusID") bonusID: string,
                        @GetUser() payload: AuthPayload) {
    return this.response({ payload: await this.bonusService.deleteBonus(orgID, bonusID, payload.email) });

  }


}
