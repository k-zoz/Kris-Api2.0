import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class PayrollPrismaHelperService {
  private readonly logger = new Logger(PayrollPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }
}
