import { Injectable, Logger } from "@nestjs/common";
import {
  OrgAppraisalPrismaHelperService
} from "@organization/org-prisma-helper-services/org-appraisal-prisma-helper.service";
import { CreateAppraisalDto, CreateSectionsForAppraisal, QuestionsDto } from "@core/dto/global/appraisal";
import { UtilService } from "@core/utils/util.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";

@Injectable()
export class EmpOrgAppraisalService {
  private readonly logger = new Logger(EmpOrgAppraisalService.name);

  constructor(private readonly empAppraisalHelperService: OrgAppraisalPrismaHelperService,
              private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService
  ) {
  }

  async createAppraisal(dto: CreateAppraisalDto, orgID: string, email: string) {
    await this.orgHelperService.findOrgByID(orgID);
    dto.startDate = this.utilService.convertDateAgain(dto.startDate);
    dto.endDate = this.utilService.convertDateAgain(dto.endDate);
    // console.log(dto);
    return await this.empAppraisalHelperService.createOrganizationAppraisal(dto, orgID, email);
  }

  async createSectionsInAppraisal(dto: CreateSectionsForAppraisal, orgID: string, appraisalID: string, email: string) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.empAppraisalHelperService.findAppraisalByID(appraisalID, orgID);
    await this.empAppraisalHelperService.findAppraisalSectionDuplicates(dto, appraisalID, orgID);
    //TODO duplicates sections name
    // TODO Delete sections
    return await this.empAppraisalHelperService.createSectionInAppraisal(dto, orgID, appraisalID, email);
  }

  async removeSectionFromAppraisal(orgID: string, appraisalID: string, sectionID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.empAppraisalHelperService.findAppraisalByID(appraisalID, orgID);
    await this.empAppraisalHelperService.findAppraisalSection(appraisalID, sectionID);
    return this.empAppraisalHelperService.deleteSectionFromAppraisal(appraisalID, sectionID);
  }

  async findAppraisalAndSections(orgID: string, appraisalID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.empAppraisalHelperService.findAppraisalByID(appraisalID, orgID);
  }

  async removeSectionFromAppraisalWithName(dto: CreateSectionsForAppraisal, orgID: string, appraisalID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.empAppraisalHelperService.findAppraisalByID(appraisalID, orgID);
    await this.empAppraisalHelperService.findAppraisalSectionByName(dto, appraisalID);
    return await this.empAppraisalHelperService.deleteSectionFromAppraisalWithNameOfSection(dto, appraisalID);
  }

  async addQuestionsToAppraisal(dto: QuestionsDto, orgID: string, appraisalID: string, sectionID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.empAppraisalHelperService.findAppraisalByID(appraisalID, orgID);
    await this.empAppraisalHelperService.findAppraisalSection(appraisalID, sectionID);
    return await this.empAppraisalHelperService.addQuestionsToAppraisalSection(appraisalID, sectionID, dto, orgID);
  }

  async allOrgAppraisals(orgID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    return await this.empAppraisalHelperService.findAllAppraisals(orgID);
  }

  async removeQuestionFromAppraisal(orgID: string, appraisalID: string, sectionID: string, questionID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.empAppraisalHelperService.findAppraisalByID(appraisalID, orgID);
    await this.empAppraisalHelperService.findAppraisalSection(appraisalID, sectionID);
    await this.empAppraisalHelperService.findSectionQuestion(sectionID, questionID);
    return this.empAppraisalHelperService.removeQuestionToAppraisalSection(sectionID, appraisalID, questionID);
  }

  async deleteAppraisal(orgID: string, appraisalID: string) {
    await this.orgHelperService.findOrgByID(orgID);
    await this.empAppraisalHelperService.findAppraisalByID(appraisalID, orgID);
    return await this.empAppraisalHelperService.removeAppraisal(orgID, appraisalID);
  }
}
