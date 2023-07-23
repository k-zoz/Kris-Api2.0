import { Module } from "@nestjs/common";
import { UserService } from "@auth/user/user.service";
import { AuthService } from "@auth/service/auth.service";
import { ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "@auth/strategies/jwt-strategy";
import { TokenService } from "@auth/token/token.service";
import { AuthController } from "@auth/controller/auth.controller";
import { UtilService } from "@core/utils/util.service";
import { UserController } from "@auth/user/user.controller";
import { AppService } from "../app.service";
import { EmployeeAuthController } from "@auth/controller/employee-auth.controller";
import { EmployeeAuthService } from "@auth/service/employee-auth.service";
import { EmployeeService } from "@auth/employee/employee.service";
import { EmployeeHelperService } from "@auth/helper-services/employee-helper.service";
import { UserHelperService } from "@auth/helper-services/user-helper.service";
import { EmployeeController } from "@auth/employee/employee.controller";
import { OrganizationService } from "@back-office/orgnization/services/organization.service";
import { LocaleService } from "@locale/locale.service";
import { LeaveHelperService } from "@organization/helper-services/leave-helper.service";
import { LeaveService } from "@organization/leave/leave.service";
import { OrganizationModule } from "@organization/organization.module";

@Module({
  imports: [JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      secret: config.get("accessTokenSecret"),
      // privateKey: config.get("privateKey"),
      signOptions: {
        // algorithm:"RS256",
        expiresIn: config.get("accessTokenLifetime")
      }
    })
  }),
    PassportModule.register({ defaultStrategy: "jwt", session: false }),OrganizationModule
  ],
  controllers: [AuthController, UserController, EmployeeAuthController,EmployeeController],
  providers: [UserService, AuthService, ConfigService, JwtStrategy,
    TokenService, UtilService, AppService, EmployeeAuthService,
    EmployeeService, EmployeeHelperService, UserHelperService,LeaveService, LocaleService],
  exports: [JwtStrategy, PassportModule,EmployeeHelperService, UserService]
})
export class AuthModule {
}
