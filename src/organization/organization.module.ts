import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";



@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt", session: false })],
  exports: [],
  controllers: [],
  providers: []
})
export class OrganizationModule {
}
