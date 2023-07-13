import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { LoginRequest } from "@auth/model/login-request";
import { EmployeeService } from "@auth/employee/employee.service";
import { AppUnauthorizedException } from "@core/exception/app-exception";
import {  JwtPayload } from "@auth/model/jwt-payload";
import { TokenService } from "@auth/token/token.service";
import { EmployeeHelperService } from "@auth/helper-services/employee-helper.service";
import { Employee } from "@core/dto/global/employee.dto";

@Injectable()
export class EmployeeAuthService {
  private readonly logger = new Logger(EmployeeAuthService.name);

  constructor(private readonly employeeService: EmployeeService,
              private readonly employeeHelperService:EmployeeHelperService,
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

  private async authenticateEmployee(employee:Employee) {
    const { email , role} = employee;
    const payload: JwtPayload = { email , role};
    const token = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);
    await this.employeeService.setUserRefreshToken(email, token);
    const orgEmployee = await this.employeeHelperService.findAndExcludeFields(employee);
    return { token, refreshToken, orgEmployee };
  }

}
