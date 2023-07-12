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

@Module({
  imports: [JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      secret: config.get("accessTokenSecret"),
      signOptions: {
        expiresIn: config.get("accessTokenLifetime")
      }
    })
  }),
    PassportModule.register({ defaultStrategy: "jwt", session: false })
  ],
  controllers: [AuthController, UserController, EmployeeAuthController],
  providers: [UserService, AuthService, ConfigService, JwtStrategy,
    TokenService, UtilService, AppService, EmployeeAuthService, EmployeeService],
  exports: [JwtStrategy, PassportModule, UserService]
})
export class AuthModule {
}
