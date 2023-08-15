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

  // async generateAccessToken(payload: any) {
  //   return this.jwtService.sign({email:payload.email, role:payload.role}, {
  //     secret: this.configService.get("accessTokenSecret"),
  //     expiresIn: "1d"
  //   });
  // }

  async generateAccessToken(payload: any) {
    return this.jwtService.sign({
  exp: Math.floor(Date.now() / 1000) + (60 * 60),
  data: {email: payload.emai, role:payload.role}
}, this.configService.get("accessTokenSecret"));
  }
  
  async generateRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get("REFRESH_TOKEN_SECRET"),
      expiresIn: this.configService.get("REFRESH_TOKEN_LIFETIME"),
      jwtid: payload.email
    });
  }

}
