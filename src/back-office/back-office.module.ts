import { Global, Module } from "@nestjs/common";
import { OrganizationController } from "@back-office/orgnization/organizationController";
import { OrganizationService } from "@back-office/orgnization/services/organization.service";
import { PassportModule } from "@nestjs/passport";
import { OrganizationHelperService } from "@back-office/orgnization/helper-services/organization-helper.service";
import { EmployeeHelperService } from "@auth/helper-services/employee-helper.service";
import { LocaleService } from "../locale/locale.service";

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt", session: false })],
  exports: [OrganizationService],
  controllers: [OrganizationController],
  providers: [OrganizationService,OrganizationHelperService,EmployeeHelperService,LocaleService]
})
export class BackOfficeModule {

}
