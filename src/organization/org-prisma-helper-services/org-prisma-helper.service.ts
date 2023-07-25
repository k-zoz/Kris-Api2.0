import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";


@Injectable()
export class OrgPrismaHelperService {
  private readonly logger = new Logger(OrgPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {}


}
