import { Controller, Get, UseGuards } from "@nestjs/common";
import { BaseController } from "@core/utils/base-controller.controller";
import { EmployeeService } from "@auth/employee/employee.service";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "@auth/decorators/get-user.decorator";
import { EmployeeRoleGuard } from "@core/guard/employee-role.guard";
import { EmpPermission } from "@core/decorator/employee-role.decorator";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";


@Controller('employee')
@UseGuards(AuthGuard())
@UseGuards(EmployeeRoleGuard)
export class EmployeeController extends BaseController{
  constructor(private readonly employeeService:EmployeeService) {
    super();
  }



  //Testing
  @Get("onboarders")
  @EmpPermission(EmployeeRoleEnum.MANAGEMENT)
  async getOnboarders(@GetUser() payload:any ) {
    console.log(payload);
  }

}
