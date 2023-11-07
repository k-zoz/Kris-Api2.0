import { Injectable } from "@nestjs/common";
import {
  JobOpeningHelperService
} from "@organization/org-prisma-helper-services/recruitment/job-opening-helper.service";
import {
  ApplyForJobDto,
  JobApplicationRequestAndResponse,
  PostJobDto,
  QuestionDto,
  SearchEmail
} from "@core/dto/global/Jobs.dto";
import { UtilService } from "@core/utils/util.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
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

  async jobApply(dto: JobApplicationRequestAndResponse, orgID: string, jobOpeningID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    const jobOpening = await this.jobOpeningPrismaHelper.findOneJobOpening(jobOpeningID, orgID);
    dto.profile.fullname = this.utilService.toUpperCase(dto.profile.fullname);
    return await this.jobOpeningPrismaHelper.applyForJobOpening(dto, organization, jobOpening);
  }

  async findOneJobOpening(orgID: string, jobOpeningID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.jobOpeningPrismaHelper.findJobOpeningAndResponse(jobOpeningID, orgID);
  }

  async uploadCredentials(file) {
    try {
      const url = await this.cloudinaryService.uploadFile(file);
      return url.url;
    } catch (e) {
      return e;
    }
  }

  async getOneJobOpening(orgID: any, jobOpeningId: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.jobOpeningPrismaHelper.findOneJobOpening(jobOpeningId, organization.id);
  }


  async addQuestionToJobOpening(orgID, jobOpeningID: string, dto: QuestionDto) {
    const jobOpening = await this.jobOpeningPrismaHelper.findOneJobOpening(jobOpeningID, orgID);
    return await this.jobOpeningPrismaHelper.addQuestionToJobOpening(jobOpening, dto);
  }

  async removeQuestion(jobQuestionID) {
    return await this.jobOpeningPrismaHelper.removeQuestionFromJobOpening(jobQuestionID);
  }

  async updateJob(jobOpeningID: string, orgID: string, dto: PostJobDto) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    const jobOpening = await this.jobOpeningPrismaHelper.findOneJobOpening(jobOpeningID, orgID);
    dto.searchEndDate = await this.utilService.convertDateAgain(dto.searchEndDate);
    return await this.jobOpeningPrismaHelper.updateJobPost(jobOpening, organization, dto);
  }

  async jobOpeningByPoster(orgID: string, dto: SearchEmail) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.jobOpeningPrismaHelper.jobOpeningANdResponse(dto, organization);
  }


  async startExcelProcess(orgID: string, jobOpeningID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    const jobOpening = await this.jobOpeningPrismaHelper.findOneJobOpening(jobOpeningID, orgID);
    return this.jobOpeningPrismaHelper.jobOpeningResponses(jobOpening, organization);
  }


}
