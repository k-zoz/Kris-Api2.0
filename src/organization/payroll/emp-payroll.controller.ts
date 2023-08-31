import { Controller, UseGuards } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmpPayrollService } from "@organization/payroll/emp-payroll.service";
import { AuthGuard } from "@nestjs/passport";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller('organization/payroll')
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmpPayrollController extends BaseController{
  constructor(private readonly payrollService:EmpPayrollService) {
    super();
  }
}
