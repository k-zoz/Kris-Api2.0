import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";


@Injectable()
export class OrgBranchPrismaHelperService {
  private readonly logger = new Logger(OrgBranchPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {}


}
