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
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>("accessTokenSecret"),
      expiresIn: this.configService.get<string>("accessTokenLifetime")
    });
  }

  async generateEmployeeAccessToken(payload){
    return this.jwtService.signAsync(payload,{
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn:process.env.ACCESS_TOKEN_LIFETIME
    })
  }

  
  async generateRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get("refreshTokenSecret"),
      expiresIn: this.configService.get("refreshTokenLifetime"),
      jwtid: payload.email
    });
  }

}
