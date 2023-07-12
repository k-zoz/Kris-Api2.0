import { Injectable, Logger } from "@nestjs/common";
import { AppNotFoundException } from "@core/exception/app-exception";
import { PrismaService } from "@prisma/prisma.service";
import * as argon from "argon2";
import { prismaExclude } from "@prisma/prisma-utils";

@Injectable()
export class EmployeeService {

  private readonly logger = new Logger(EmployeeService.name);

  constructor(private prismaService: PrismaService) {
  }

  async findFirst(email: string) {
    const user = await this.prismaService.employee.findFirst({ where: { empEmail: email } });
    if (!user) {
      const errMessage = `Invalid email or password`;
      this.logger.error(errMessage);
      throw new AppNotFoundException(errMessage);
    }
    return user;
  }


  async validatePassword(emp, password: string): Promise<boolean> {
    return await argon.verify(emp.empPassword, password);
  }

  async setUserRefreshToken(email: string, refreshToken) {
    await this.prismaService.employee.update({
      where: { empEmail: email },
      data: {
        refreshToken
      }
    });
  }

  async findAndExcludeFields(employee) {
    return this.prismaService.employee.findUniqueOrThrow({
      where: { empEmail: employee.empEmail },
      select: prismaExclude("Employee", ["empPassword", "refreshToken"])
    });
  }
}
