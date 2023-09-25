import { Injectable } from "@nestjs/common";
import {
  JobOpeningHelperService
} from "@organization/org-prisma-helper-services/recruitment/job-opening-helper.service";
import { ApplyForJobDto, PostJobDto } from "@core/dto/global/Jobs.dto";
import { UtilService } from "@core/utils/util.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { Express } from "express";
import { CloudinaryService } from "@cloudinary/cloudinary.service";

@Injectable()
export class JobOpeningService {
  constructor(private readonly jobOpeningPrismaHelper: JobOpeningHelperService,
              private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly cloudinaryService: CloudinaryService
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

  async jobApply(dto: ApplyForJobDto, orgID: string, jobOpeningID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.jobOpeningPrismaHelper.findJobOpeningById(jobOpeningID, orgID);
    dto.fullname = this.utilService.toUpperCase(dto.fullname);
    return await this.jobOpeningPrismaHelper.applyForJobOpening(dto, orgID, jobOpeningID);
  }

  async findOneJobOpening(orgID: string, jobOpeningID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.jobOpeningPrismaHelper.findJobOpeningById(jobOpeningID, orgID);
  }

  async uploadCredentials(file) {
    try {
      const url = await this.cloudinaryService.uploadFile(file);
      return url.url;
    } catch (e) {
      return e;
    }
  }


}
