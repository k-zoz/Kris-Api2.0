import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { ActivityLogDto } from "@core/dto/global/activity-log.dto";
import { Organization } from "@prisma/client";
import { AppException } from "@core/exception/app-exception";
import { UtilService } from "@core/utils/util.service";

@Injectable()
export class OrgActivityLogPrismaHelperService {
  private readonly logger = new Logger(OrgActivityLogPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService,
              private readonly utilService: UtilService
  ) {
  }

  async createActivityLog(dto: ActivityLogDto, orgID: any) {
    const time = this.utilService.localTimeZoneDate();
    try {
      await this.prismaService.activityLog.create({
        data: {
          description: dto.description,
          organizationID: orgID,
          time
        }
      });
      return "Created";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }


  async myOrganizationActivityLog(organization: Organization) {
    try {
      return await this.prismaService.activityLog.findMany({
        where: {
          organizationID: organization.id
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

}
