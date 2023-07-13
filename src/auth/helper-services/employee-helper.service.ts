import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class EmployeeHelperService {
  private readonly logger = new Logger(EmployeeHelperService.name)

  constructor(private readonly prismaService :PrismaService) {
  }
}
