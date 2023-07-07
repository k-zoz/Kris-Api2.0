import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { LoginRequest } from "@auth/model/login-request";
import { UserService } from "@auth/user/user.service";
import { AppTokenExpiredException, AppUnauthorizedException } from "@core/exception/app-exception";
import { JwtPayload } from "@auth/model/jwt-payload";
import { TokenService } from "@auth/token/token.service";
import { JwtService } from "@nestjs/jwt";
import { CreateSuperUserDto } from "@core/dto/auth/user-dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly configService: ConfigService,
              private readonly userService: UserService,
              private readonly tokenService: TokenService,
              private readonly jwtService: JwtService
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


  async onboardBackOfficeUser(onboard:CreateSuperUserDto, backOfficeUserEmail){
    const user = await this.userService.create(onboard)
    return this.authenticateNewBackOfficeUser(user, backOfficeUserEmail.email)
    // TODO if you're an admin and have such right to create an admin
  }



  private async authenticateBackOfficeUser(user) {
    const { email , role, } = user;

    const payload: JwtPayload = { email, role };
    const token = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);
    await this.userService.updateUser(email, refreshToken);
    const backOfficeUser = await this.userService.findByEmailAndExcludeFields(email);
    return { token, refreshToken, backOfficeUser };
  }

  private async authenticateNewBackOfficeUser(user, creatorMail:string) {
    const { email } = user;

    const payload: JwtPayload = { email };
    const token = await this.tokenService.generateAccessToken(payload);
    // const refreshToken = await this.tokenService.generateRefreshToken(payload);
    await this.userService.updateNewUser(email, creatorMail);
    const backOfficeUser = await this.userService.findByEmailAndExcludeFields(email);
    return {  backOfficeUser };
  }



  async refreshToken(refreshToken: string) {
    const token = this.jwtService.verify(refreshToken, { secret: this.configService.get("REFRESH_TOKEN_SECRET") });

    /// token belongs to user
    const user = await this.userService.findByEmail(token.jwtid);
    if (user.refreshToken != refreshToken) {
      throw  new AppTokenExpiredException(`Token is Invalid`);
    }

    const { email } = user;
    const payload: JwtPayload = { email };
    return this.tokenService.generateAccessToken(payload);
  }


}
