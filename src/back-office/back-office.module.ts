import { Module } from "@nestjs/common";
import { OrganizationController } from "@back-office/orgnization/organizationController";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { PassportModule } from "@nestjs/passport";

@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt", session: false })],
  exports: [],
  controllers: [OrganizationController],
  providers: [OrganizationService]
})
export class BackOfficeModule {

}
