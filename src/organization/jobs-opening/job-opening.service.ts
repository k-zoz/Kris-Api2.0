import { Injectable } from "@nestjs/common";
import {
  JobOpeningHelperService
} from "@organization/org-prisma-helper-services/recruitment/job-opening-helper.service";
import { PostJobDto } from "@core/dto/global/Jobs.dto";
import { UtilService } from "@core/utils/util.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";

@Injectable()
export class JobOpeningService {
  constructor(private readonly jobOpeningPrismaHelper: JobOpeningHelperService,
              private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService
  ) {
  }

  async postAJob(dto: PostJobDto, orgID: string, email: string) {
    await this.orgHelperService.findOrgByID(orgID);
    dto.searchEndDate = this.utilService.convertDateAgain(dto.searchEndDate);
    return await this.jobOpeningPrismaHelper.postAJob(dto, orgID, email);
  }

  async allOrgJobsOpening(orgID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.jobOpeningPrismaHelper.findAllOrgPostedJobs(orgID);
  }

  async allOrgJobs(orgID: string, orgKrisID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.orgHelperService.findOrgByKrisId(orgKrisID);
    return await this.jobOpeningPrismaHelper.findAllOrgPostedJobs(orgID);
  }
}
