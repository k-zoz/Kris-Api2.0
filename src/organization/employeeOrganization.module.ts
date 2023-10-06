import { Global, Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { controllers, providers } from "@organization/org";

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt", session: false })],
  exports: [...providers],
  controllers: [...controllers],
  providers: [...providers]
})
export class EmployeeOrganizationModule {
}
