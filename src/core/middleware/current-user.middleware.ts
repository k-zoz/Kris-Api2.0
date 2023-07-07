import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, request, Request, Response } from "express";
import { UserService } from "@auth/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthPayload } from "@core/dto/auth/auth-payload";
import { AppTokenExpiredException } from "@core/exception/app-exception";

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService,
              private readonly jwtService: JwtService,
              private readonly configService: ConfigService
  ) {
  }

  async use(req: Request, res: Response, next: NextFunction) {
    //so this middleware was created because, for authorization to make a request, the req header needs the user(payload property)
    // it took the property, then split the Bearer from the signed token
    //verified the token
    //set the token as payload for the jwt strategy to use
    const payload = req as any;
    const authPayload = new AuthPayload();
    const request1 = payload.rawHeaders;

    // Loop through the array and check for strings starting with 'Bearer'
    let bearerString:string;
    for (const str of request1) {
      if (str.startsWith('Bearer')) {
        bearerString = str;
        break; // Exit the loop after finding the first match
      }
    }

    if(!bearerString){
      throw new AppTokenExpiredException("Token not provided. Kindly sign in");
    }else {
      const bearerStringSplit = bearerString.split(" ")
      const token = bearerStringSplit[1]
      payload.authPayload = await this.jwtService.verify(token, { secret: this.configService.get("ACCESS_TOKEN_SECRET") });
    }
    next();
  }

}
