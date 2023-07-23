import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { LeaveController } from "@organization/leave/leave.controller";
import { LeaveService } from "@organization/leave/leave.service";
import { LeaveHelperService } from "@organization/helper-services/leave-helper.service";
import { EmployeeHelperService } from "@auth/helper-services/employee-helper.service";
import { LocaleService } from "@locale/locale.service";
import { UtilService } from "@core/utils/util.service";



@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt", session: false })],
  exports: [LeaveService, LeaveHelperService],
  controllers: [LeaveController],
  providers: [LeaveService, LeaveHelperService, EmployeeHelperService, LocaleService, UtilService]
})
export class OrganizationModule {
}
