import { Injectable, Logger } from "@nestjs/common";
import {
  ApplyForJobDto,
  JobApplicationRequestAndResponse,
  PostJobDto,
  QuestionDto,
  SearchEmail
} from "@core/dto/global/Jobs.dto";
import { AppException, AppNotFoundException } from "@core/exception/app-exception";
import { PrismaService } from "@prisma/prisma.service";
import { JobOpening, Organization } from "@prisma/client";

@Injectable()
export class JobOpeningHelperService {
  private readonly logger = new Logger(JobOpeningHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async postAJob(dto: PostJobDto, orgID: string, email: string) {
    try {
      await this.prismaService.jobOpening.create({
        data: {
          title: dto.title,
          information: dto.information,
          jobDescription: dto.jobDescription,
          searchEndDate: dto.searchEndDate,
          createdBy: email,
          organizationID: orgID
        }
      });
      return "Created Successfully";
    } catch (e) {
      this.logger.log(e);
      throw new AppException("Error posting job");
    }
  }

  async findAllOrgPostedJobs(orgID: string) {
    try {
      const [organization, jobOpenings] = await this.prismaService.$transaction([
        this.prismaService.organization.findUnique({
          where: { id: orgID }
        }),
        this.prismaService.jobOpening.findMany({
          where: {
            organizationID: orgID
          },
          include: {
            Organization: true,
            JobQuestions: true,
            JobOpeningResponses: true
          },
          orderBy: {
            createdDate: "asc"
          }
        })
      ]);
      return { organization, jobOpenings };
    } catch (e) {
      this.logger.log(e);
      throw new AppException();
    }
  }

  async findJobOpeningAndResponse(jobOpeningID: string, orgID: string) {

    const [jobOpenings, jobOpeningsResponses, applicants] = await this.prismaService.$transaction([

      this.prismaService.jobOpening.findFirst({
        where: {
          id: jobOpeningID,
          organizationID: orgID
        }
      }),

      this.prismaService.jobOpeningResponses.findMany({
        where: {
          jobOpeningID: jobOpeningID,
          organizationID: orgID
        }
      }),

      this.prismaService.jobOpeningResponses.count({
        where: {
          jobOpeningID: jobOpeningID,
          organizationID: orgID
        }
      })
    ]);


    if (!jobOpenings) {
      const msg = `Job opening with id ${jobOpeningID} does not exist`;
      this.logger.error(msg);
      throw new AppNotFoundException(msg);
    }
    return { jobOpenings, jobOpeningsResponses, applicants };
  }


  async findOneJobOpening(jobOpeningID: string, orgID: string) {
    const found = await this.prismaService.jobOpening.findFirst({
      where: {
        id: jobOpeningID,
        organizationID: orgID
      },
      include: {
        JobQuestions: true
      }
    });

    if (!found) {
      const msg = `Job opening with ${jobOpeningID}  id  does not exist`;
      this.logger.error(msg);
      throw new AppNotFoundException(msg);
    }
    return found;
  }

  async applyForJobOpening(dto: JobApplicationRequestAndResponse, orgID: string, jobOpeningID: string) {
    try {
      await this.prismaService.jobOpeningResponses.create({
        data: {
          fullname: dto.profile.fullname,
          email: dto.profile.email,
          resumeUrl: dto.profile.resumeUrl,
          coverLetterUrl: dto.profile.coverLetterUrl,
          responses: dto.responses,
          jobOpeningID: jobOpeningID,
          organizationID: orgID
        }
      });
      return "Job application sent successfully";
    } catch (e) {
      this.logger.log(e);
      throw new AppException();
    }
  }

  async jobOpeningResponses(jobOpening: JobOpening, organization: Organization) {
    return this.prismaService.jobOpeningResponses.findMany({
      where: {
        jobOpeningID: jobOpening.id,
        organizationID: organization.id
      },
    });
  }

  async addQuestionToJobOpening(jobOpening: JobOpening, dto: QuestionDto) {
    try {
      await this.prismaService.jobQuestion.create({
        data: {
          question: dto.question,
          JobOpening: {
            connect: {
              id: jobOpening.id
            }
          }
        }
      });
    } catch (e) {
      this.logger.log(e);
      throw new AppException();
    }
  }

  async removeQuestionFromJobOpening(jobQuestionID) {
    try {
      await this.prismaService.jobQuestion.delete({
        where: { id: jobQuestionID }
      });

    } catch (e) {
      this.logger.log(e);
      throw new AppException();
    }
  }

  async updateJobPost(jobOpening: JobOpening, organization: Organization, dto: PostJobDto) {
    try {
      await this.prismaService.jobOpening.update({
        where: {
          id: jobOpening.id
        },
        data: {
          information: dto.information,
          jobDescription: dto.jobDescription,
          searchEndDate: dto.searchEndDate
        }
      });
    } catch (e) {
      this.logger.log(e);
      throw new AppException("Error making changes!");
    }
  }

  async jobOpeningANdResponse(dto: SearchEmail, organization: Organization) {
    try {
      return await this.prismaService.jobOpening.findMany({
        where: {
          organizationID: organization.id,
          createdBy: dto.email
        },
        include: {
          JobQuestions: true,
          JobOpeningResponses: true
        }
      });
    } catch (e) {
      this.logger.log(e);
      throw new AppException("Error getting job openings!");
    }
  }
}
