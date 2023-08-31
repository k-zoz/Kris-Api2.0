import { Global, Module } from "@nestjs/common";
import { OrganizationController } from "@back-office/orgnization/organizationController";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { PassportModule } from "@nestjs/passport";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { LocaleService } from "@locale/locale.service";
import { EmployeeController } from "@back-office/employee/employee.controller";
import { UserPrismaHelperService } from "@back-office/helper-services/user-prisma-helper.service";
import { UserController } from "@back-office/user/user.controller";
import { EmployeeService } from "@back-office/employee/employee.service";
import { EmployeeOrganizationModule } from "@organization/employeeOrganization.module";
import { AuthModule } from "@auth/auth.module";
import { UtilService } from "@core/utils/util.service";
import { UserService } from "@back-office/user/user.service";

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt", session: false })],
  exports: [OrganizationService, OrganizationPrismaHelperService, EmployeePrismaHelperService, UserPrismaHelperService, EmployeeService, UserService],
  controllers: [OrganizationController, EmployeeController, UserController],
  providers: [OrganizationService, OrganizationPrismaHelperService, EmployeePrismaHelperService, UserPrismaHelperService, EmployeeService, UserService, LocaleService, UtilService]
})
export class BackOfficeModule {

}
