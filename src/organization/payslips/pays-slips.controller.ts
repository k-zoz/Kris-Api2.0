import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { PaysSlipsService } from "@organization/payslips/pays-slips.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { SkipThrottle } from "@nestjs/throttler";


@SkipThrottle()
@Controller("organization/payslips")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class PaysSlipsController extends BaseController {
  constructor(private readonly payslipService: PaysSlipsService) {
    super();
  }

  @Get("/:orgID/viewAll/:empID")
  async allMyPayslips(@Param("orgID") orgID: string,
                      @Param("empID") empID: string,
  ) {
    return this.response({payload:await this.payslipService.allMyPayslips(orgID, empID)})
  }
}
