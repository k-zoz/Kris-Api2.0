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

  async generateAccessToken(payload: any) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get("accessTokenSecret"),
      expiresIn: this.configService.get("accessTokenLifetime")
    });
  }

  async generateRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get("REFRESH_TOKEN_SECRET"),
      expiresIn: this.configService.get("REFRESH_TOKEN_LIFETIME"),
      jwtid: payload.email
    });
  }

}
