import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "@auth/model/jwt-payload";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(private readonly jwtService: JwtService,
              private readonly configService: ConfigService
  ) {
  }

  async generateAccessToken(payload) {
    return this.jwtService.sign(payload);
  }

//   async generateAccessToken(payload: any) {
//     return this.jwtService.sign({
//   expiresIn: Math.floor(Date.now() / 1000) + (60 * 60),
//   data: {email: payload.email, role:payload.role}
// }, this.configService.get("accessTokenSecret"));
//   }
  
  async generateRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get("REFRESH_TOKEN_SECRET"),
      expiresIn: this.configService.get("REFRESH_TOKEN_LIFETIME"),
      jwtid: payload.email
    });
  }

}
