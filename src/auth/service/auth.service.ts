import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { LoginRequest } from "@auth/model/login-request";
import { UserService } from "@auth/user/user.service";
import { AppUnauthorizedException } from "@core/exception/app-exception";
import { JwtPayload } from "@auth/model/jwt-payload";
import { TokenService } from "@auth/token/token.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly configService: ConfigService,
              private readonly userService: UserService,
              private readonly tokenService: TokenService
  ) {
  }

  async backOfficeLogin(request: LoginRequest) {
    const { email, password } = request;

    const user = await this.userService.findByEmail(email);

    if (!user || !(await this.userService.validatePassword(user, password))) {
      this.logger.error(`Login failed ${email}`);
      throw new AppUnauthorizedException("Invalid email or password");
    }

    return this.authenticateBackOfficeUser(user);
  }

  private async authenticateBackOfficeUser(user) {
    const { email } = user;

    const payload: JwtPayload = { email: email };
    const token = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload)
    await this.userService.updateUser(email, refreshToken)
    const backOfficeUser = await this.userService.findByEmailAndExcludeFields(email)
    return {token, refreshToken, backOfficeUser}
  }
}
