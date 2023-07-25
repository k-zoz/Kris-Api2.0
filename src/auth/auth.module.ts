import { Module } from "@nestjs/common";
import { UserService } from "@back-office/user/user.service";
import { AuthService } from "@auth/service/auth.service";
import { ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "@auth/strategies/jwt-strategy";
import { TokenService } from "@auth/token/token.service";
import { AuthController } from "@auth/controller/auth.controller";
import { UtilService } from "@core/utils/util.service";
import { UserController } from "@back-office/user/user.controller";
import { AppService } from "../app.service";
import { EmployeeAuthController } from "@auth/controller/employee-auth.controller";
import { EmployeeAuthService } from "@auth/service/employee-auth.service";
import { EmployeeService } from "@back-office/employee/employee.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { UserPrismaHelperService } from "@back-office/helper-services/user-prisma-helper.service";
import { EmployeeController } from "@back-office/employee/employee.controller";
import { OrganizationService } from "@back-office/orgnization/organization.service";
import { LocaleService } from "@locale/locale.service";
import { LeavePrismaHelperService } from "@organization/org-prisma-helper-services/leave-prisma-helper.service";
import { LeaveService } from "@organization/leave/leave.service";
import { EmployeeOrganizationModule } from "@organization/employeeOrganization.module";

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
    PassportModule.register({ defaultStrategy: "jwt", session: false }),EmployeeOrganizationModule
  ],
  controllers: [AuthController, UserController, EmployeeAuthController,EmployeeController],
  providers: [UserService, AuthService, ConfigService, JwtStrategy,
    TokenService, UtilService, AppService, EmployeeAuthService,
    EmployeeService, EmployeePrismaHelperService, UserPrismaHelperService,LeaveService, LocaleService],
  exports: [JwtStrategy, PassportModule,EmployeePrismaHelperService, UserService]
})
export class AuthModule {
}
