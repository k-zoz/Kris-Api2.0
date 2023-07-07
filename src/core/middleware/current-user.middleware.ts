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
    const request = payload.rawHeaders[1];
    if (!request.startsWith("Bearer")) {
      throw new AppTokenExpiredException("Token not provided. Kindly sign in");
    } else {
      const requestSplit = request.split(" ");
      const token = requestSplit[1];
      payload.authPayload = await this.jwtService.verify(token, { secret: this.configService.get("ACCESS_TOKEN_SECRET") });
    }

    next();
  }

}
