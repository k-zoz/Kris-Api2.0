import { Global, Module } from "@nestjs/common";
import { AuthService } from "@auth/service/auth.service";
import { ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "@auth/strategies/jwt-strategy";
import { TokenService } from "@auth/token/token.service";
import { AuthController } from "@auth/controller/auth.controller";
import { UtilService } from "@core/utils/util.service";
import { EmployeeAuthController } from "@auth/controller/employee-auth.controller";
import { EmployeeAuthService } from "@auth/service/employee-auth.service";
import { LocaleService } from "@locale/locale.service";


@Global()
@Module({
  imports: [JwtModule.register({
            secret: process.env.ACCESS_TOKEN_SECRET,
    signOptions: { expiresIn: process.env.ACCESS_TOKEN_SECRET }
        }),
    PassportModule.register({ defaultStrategy: "jwt", session: false }),
  ],
  controllers: [AuthController, EmployeeAuthController],
  providers: [AuthService, ConfigService, JwtStrategy, TokenService, UtilService, EmployeeAuthService, LocaleService],
  exports: [JwtStrategy, PassportModule,AuthService,EmployeeAuthService]
})
export class AuthModule {
}
