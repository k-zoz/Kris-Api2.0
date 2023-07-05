import { Module } from '@nestjs/common';
import { UserService } from "@auth/user/user.service";
import { AuthService } from "@auth/service/auth.service";
import { ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "@auth/strategies/jwt-strategy";
import { TokenService } from "@auth/token/token.service";
import { AuthController } from "@auth/controller/auth.controller";

@Module({
  imports:[JwtModule.register({
    secret: process.env.JWT_SECRET
  }),
    PassportModule.register({defaultStrategy:'jwt', session:false}),
  ],
  controllers:[AuthController],
  providers:[UserService, AuthService, ConfigService, JwtStrategy, TokenService],
  exports:[JwtStrategy, PassportModule]
})
export class AuthModule {}
