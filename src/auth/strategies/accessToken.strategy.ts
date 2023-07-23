import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "@auth/model/jwt-payload";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "jwt") {
  // constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {
  //   super({
  //     usernameField: "email",
  //     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  //     ignoreExpiration: false,
  //     secretOrKey: config.get("JWT_SECRET")
  //   });
  // }

  // validate(payload: JwtPayload) {
  //   return payload;
  // }
}
