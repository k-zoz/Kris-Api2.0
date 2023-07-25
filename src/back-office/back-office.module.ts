import { Global, Module } from "@nestjs/common";
import { OrganizationController } from "@back-office/orgnization/organizationController";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { PassportModule } from "@nestjs/passport";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { LocaleService } from "../locale/locale.service";

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt", session: false })],
  exports: [OrganizationService],
  controllers: [OrganizationController],
  providers: [OrganizationService,OrganizationPrismaHelperService,EmployeePrismaHelperService,LocaleService]
})
export class BackOfficeModule {

}
