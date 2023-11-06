import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { PayrollApproveService } from "@organization/payroll-approve/payroll-approve.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { SkipThrottle } from "@nestjs/throttler";


@SkipThrottle()
@Controller("organization/payrollApprove")
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class PayrollApproveController extends BaseController {
  constructor(private readonly payrollApproveService: PayrollApproveService) {
    super();
  }

  @Get("/:orgID/payrollApprove/:payrollPreviewID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async getPayrollPreviewAndToTal(@Param("orgID") orgID: string,
                                  @Param("payrollPreviewID") payrollPreviewID: string,
                                  @GetUser() payload: AuthPayload) {
    return this.response({ payload: await this.payrollApproveService.getPayrollAndTotal(orgID, payrollPreviewID) });
  }

  @Get("/:orgID/startPayrollApprove/:payrollPreviewID")
  @EmpPermission(EmployeeRoleEnum.FINANCE, EmployeeRoleEnum.MANAGEMENT)
  async approvePayrollPreview(@Param("orgID") orgID: string,
                              @Param("payrollPreviewID") payrollPreviewID: string,
                              @GetUser() payload: AuthPayload) {
    return this.response({ payload: await this.payrollApproveService.approvePayrollPreview(orgID, payrollPreviewID, payload.email) });
  }

}
