import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "@auth/model/jwt-payload";
import { Request } from "express";
import { UserService } from "@back-office/user/user.service";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { AppTokenExpiredException } from "@core/exception/app-exception";
import * as process from "process";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService, private readonly userService: UserService) {
    super({
      usernameField: "email",
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      jsonWebTokenOptions: { expiresIn: process.env.ACCESS_TOKEN_LIFETIME }
    });
  }

  async validate(payload) {
    const jwtPayload: JwtPayload = payload;
    const { email, role, exp } = jwtPayload;
    return { email, role };
  }

}
