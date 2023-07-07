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
    console.log(payload);


    const { email, role } = payload;
    if (!email || !role) {
      throw new AppTokenExpiredException("Token not provided!");
    }
    const user = await this.userService.findByEmail(email);
    return { email: user.email, role: user.role } as AuthPayload;


  }

}
