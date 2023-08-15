import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { AppTokenExpiredException } from "@core/exception/app-exception";

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService,
              private readonly configService: ConfigService
  ) {
  }

  //This middleware was created, for authorization.
  //To access the incoming request, the req header needs the user(payload property)
  //It also need the Authorization and Bearer from the raw headers of the incoming request
  //It splits the Bearer from the signed token
  //Verifies the token
  //then set the token as payload for the jwt strategy to use
  async use(req: Request, res: Response, next: NextFunction) {
    const payload = req as any;
    const authPayload = new AuthPayload();
    const request = payload.rawHeaders;

    // Loop through the array and check for strings starting with 'Bearer'
    let bearerString: string;
    for (const str of request) {
      if (str.startsWith("Bearer")) {
        bearerString = str;
        break; // Exit the loop after finding the first match
      }
    }

    if (!bearerString) {
      payload.authPayload = authPayload
      throw new AppTokenExpiredException("Token not provided!. Kindly sign in.");
    } else {
      try {
        const bearerStringSplit = bearerString.split(" ");
        const token = bearerStringSplit[1];
        payload.authPayload = await this.jwtService.verify(token, { secret: this.configService.get("accessTokenSecret"), 
                                                                   expiresIn: this.this.configService.get("accessTokenLifetime") });
      } catch (err) {
        throw new AppTokenExpiredException("Invalid or Expired token! Kindly sign in.");
      }

    }
    next();
  }

}
