import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "@auth/model/jwt-payload";
import { Request } from "express";
import { UserService } from "@auth/user/user.service";
import { AuthPayload } from "@core/dto/auth/auth-payload";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService, private readonly userService: UserService) {
    super({
      usernameField: "email",
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: config.get("JWT_SECRET")
    });
  }

  async validate(request: Request, payload: JwtPayload) {
    const { email } = payload;
    const user = await this.userService.findByEmail(email);
    return { userId: user.id, email: user.email, phoneNumber: user.phoneNumber } as AuthPayload;

  }
}
