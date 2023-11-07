import { Injectable, Logger } from "@nestjs/common";
import { JobApplicationRequestAndResponse, PostJobDto, QuestionDto, SearchEmail } from "@core/dto/global/Jobs.dto";
import { AppException, AppNotFoundException } from "@core/exception/app-exception";
import { PrismaService } from "@prisma/prisma.service";
import { JobOpening, Organization } from "@prisma/client";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "@alert/email/email.service";
import { UtilService } from "@core/utils/util.service";
import { JobApplicationConfirmationEmail } from "@core/event/back-office-event";


@Injectable()
export class JobOpeningHelperService {
  private readonly logger = new Logger(JobOpeningHelperService.name);
  private readonly mailSource = this.configService.get("mailSender");
  private resend: Resend;

  constructor(private readonly prismaService: PrismaService,
              private readonly configService: ConfigService,
              private readonly emailService: EmailService,
              private readonly utilService: UtilService
  ) {
    const resendKey = this.configService.get("resendApiKey");
    this.resend = new Resend(resendKey);
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
            organizationID: orgID,
            OR: [
              {
                searchEndDate: {
                  lte: new Date() // only include job openings where the searchEndDate is less than or equal to today's date
                }
              },
              {
                searchEndDate: null // also include job openings where the searchEndDate is not set
              }
            ]
          },
          include: {
            Organization: true,
            JobQuestions: true,
            JobOpeningResponses: true
          },
          orderBy: {
            createdDate: "desc"
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

  async applyForJobOpening(dto: JobApplicationRequestAndResponse, org: Organization, jobOpening: JobOpening) {
    try {
      await this.prismaService.$transaction(async (tx) => {

        await tx.jobOpeningResponses.create({
          data: {
            fullname: dto.profile.fullname,
            email: dto.profile.email,
            resumeUrl: dto.profile.resumeUrl,
            coverLetterUrl: dto.profile.coverLetterUrl,
            responses: dto.responses,
            jobOpeningID: jobOpening.id,
            organizationID: org.id
          }
        });

        try {
          const html = await this.emailService.jobApplicationConfirmationEmail({
            job_title: jobOpening.title,
            company_name: org.orgName,
            applicant_name: dto.profile.fullname
          } as JobApplicationConfirmationEmail);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${dto.profile.email}`,
            subject: "Job Application Confirmation",
            html: `${html}`
          });
          this.logger.log(`Email Successfully sent to ${dto.profile.email}`);
          return "Job application sent successfully";
        } catch (e) {
          this.logger.error(e);
          throw new AppException("Error sending email");
        }
      });

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
      }
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
          searchEndDate: dto.searchEndDate,
          location: dto.location,
          salary_range: dto.salary_range
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
