import { Module } from "@nestjs/common";
import { OrganizationController } from "@back-office/orgnization/organizationController";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { PassportModule } from "@nestjs/passport";
import { OrganizationHelperService } from "@back-office/orgnization/helper-services/organization-helper.service";

@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt", session: false })],
  exports: [],
  controllers: [OrganizationController],
  providers: [OrganizationService,OrganizationHelperService]
})
export class BackOfficeModule {

}
