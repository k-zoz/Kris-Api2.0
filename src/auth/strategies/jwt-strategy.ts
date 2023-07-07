import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "@auth/model/jwt-payload";
import { Request } from "express";
import { UserService } from "@auth/user/user.service";
import { AuthPayload } from "@core/dto/auth/auth-payload";
import { AppTokenExpiredException } from "@core/exception/app-exception";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService, private readonly userService: UserService) {
    super({
      usernameField: "email",
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: config.get("ACCESS_TOKEN_SECRET")
    });
  }

  async validate(payload) {
    const jwtPayload: JwtPayload = payload.authPayload;
    const { email, role, exp } = jwtPayload;
    const expiry = exp * 1000;
    if (Date.now() > expiry) {
      throw new AppTokenExpiredException();
    }
    return { email, role };
  }

}
