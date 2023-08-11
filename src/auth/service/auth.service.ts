import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoginRequest } from "@auth/model/login-request";
import { UserService } from "@back-office/user/user.service";
import { AppTokenExpiredException, AppUnauthorizedException } from "@core/exception/app-exception";
import { JwtPayload } from "@auth/model/jwt-payload";
import { TokenService } from "@auth/token/token.service";
import { JwtService } from "@nestjs/jwt";
import { UserPrismaHelperService } from "@back-office/helper-services/user-prisma-helper.service";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { UtilService } from "@core/utils/util.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly configService: ConfigService,
              private readonly userService: UserService,
              private readonly userHelperService: UserPrismaHelperService,
              private readonly tokenService: TokenService,
              private readonly jwtService: JwtService,

  ) {
  }

  async backOfficeLogin(request: LoginRequest) {
    const { email, password } = request;
    const user = await this.userHelperService.findFirst(email);
    if (!user || !(await this.userService.validatePassword(user, password))) {
      this.logger.error(`Login failed ${email}`);
      throw new AppUnauthorizedException("Invalid Email or Password");
    }
    return this.authenticateBackOfficeUser(user);
  }


  private async authenticateBackOfficeUser(user) {
    const { email, role } = user;
    const payload: JwtPayload = { email, role };
    const token = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);
    await this.userHelperService.setUserRefreshToken(email, refreshToken);
    const backOfficeUser = await this.userHelperService.findAndExcludeFieldDuringSignUp(user);
    return { token, backOfficeUser };
  }


  async refreshToken(refreshToken: string) {
    const token = this.jwtService.verify(refreshToken, { secret: this.configService.get("refreshTokenSecret") });

    /// token belongs to user
    const user = await this.userHelperService.findByEmail(token.jwtid);
    if (user.refreshToken != refreshToken) {
      throw  new AppTokenExpiredException(`Token is Invalid`);
    }

    const { email } = user;
    const payload: JwtPayload = { email };
    return this.tokenService.generateAccessToken(payload);
  }


}
