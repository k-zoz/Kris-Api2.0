import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { LoginRequest } from "@auth/model/login-request";
import { EmployeeService } from "@auth/employee/employee.service";
import { AppUnauthorizedException } from "@core/exception/app-exception";
import { EmpJwtPayload, JwtPayload } from "@auth/model/jwt-payload";
import { TokenService } from "@auth/token/token.service";

@Injectable()
export class EmployeeAuthService {
  private readonly logger = new Logger(EmployeeAuthService.name);

  constructor(private readonly employeeService: EmployeeService,
              private readonly tokenService: TokenService
  ) {
  }

  async employeeLogin(request: LoginRequest) {
    const { email, password } = request;
    const employee = await this.employeeService.findFirst(email);
    if (!employee || !(await this.employeeService.validatePassword(employee, password))) {
      this.logger.error(`Login failed ${email}`);
      throw new AppUnauthorizedException("Invalid email or password");
    }
    return this.authenticateEmployee(employee);
  }

  private async authenticateEmployee(employee) {
    const { empEmail } = employee;
    const payload: EmpJwtPayload = { empEmail };
    const token = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);
    await this.employeeService.setUserRefreshToken(empEmail, token);
    const orgEmployee = await this.employeeService.findAndExcludeFields(employee);
    return { token, refreshToken, orgEmployee };
  }

}
