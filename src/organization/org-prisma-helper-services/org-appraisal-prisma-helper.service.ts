import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { CreateAppraisalDto, CreateSectionsForAppraisal, QuestionsDto } from "@core/dto/global/appraisal";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { Appraisal } from "@prisma/client";

@Injectable()
export class OrgAppraisalPrismaHelperService {
  private readonly logger = new Logger(OrgAppraisalPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async createOrganizationAppraisal(dto: CreateAppraisalDto, orgID: string, email: string) {
    try {
      await this.prismaService.appraisal.create({
        data: {
          name: dto.name,
          description: dto.description,
          startDate: dto.startDate,
          endDate: dto.endDate,
          organizationId: orgID,
          createdBy: email
        }
      });
      return "Appraisal created successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findAppraisalByID(appraisalID: string, orgID: string) {

    const found = await this.prismaService.appraisal.findFirst({
      where: {
        id: appraisalID,
        organizationId: orgID
      },
      include: {
        section: {
          include: {
            question: true
          }
        }
      }
    });

    if (!found) {
      const msg = `Appraisal with id ${appraisalID} does not exist`;
      this.logger.error(msg);
      throw new AppNotFoundException(msg);
    }
    return found;
  }

  async createSectionInAppraisal(dto: CreateSectionsForAppraisal, orgID: string, appraisalID: string, email: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const section = await tx.appraisal_Section.create({
          data: {
            name: dto.name,
            description: dto.description,
            appraisalId: appraisalID
          }
        });
      });
      return "Section created successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findAppraisalSectionDuplicates(dto: CreateSectionsForAppraisal, appraisalID: string, orgID: string) {
    const section = await this.prismaService.appraisal_Section.findFirst({
      where: {
        appraisalId: appraisalID,
        name: dto.name
      }
    });
    if (section) {
      throw  new AppConflictException(`Section ${dto.name} already exists`);
    }
  }

  async findAppraisalSection(appraisalID: string, sectionID: string) {
    const found = await this.prismaService.appraisal_Section.findFirst({
      where: {
        id: sectionID,
        appraisalId: appraisalID
      }
    });

    if (!found) {
      const msg = `Section with id ${sectionID} does not exist`;
      this.logger.error(msg);
      throw new AppNotFoundException(msg);
    }
    return found;
  }

  async deleteSectionFromAppraisal(appraisalID: string, sectionID: string) {
    try {
      await this.prismaService.appraisal_Section.delete({
        where: {
          id: sectionID
        }
      });
      return "Successful";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findAppraisalSectionByName(dto: CreateSectionsForAppraisal, appraisalID: string) {
    const found = await this.prismaService.appraisal_Section.findFirst({
      where: {
        name: dto.name,
        appraisalId: appraisalID
      }
    });

    if (!found) {
      const msg = `Section with name ${dto.name} does not exist`;
      this.logger.error(msg);
      throw new AppNotFoundException(msg);
    }
    return found;
  }

  async deleteSectionFromAppraisalWithNameOfSection(dto: CreateSectionsForAppraisal, appraisalID: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        // const appraisal = tx.appraisal.findFirst({
        //    where:{
        //      id:appraisalID
        //    }
        // })
      });
      // await this.prismaService.appraisal_Section.delete({
      //   where: {
      //     id:appraisalID,
      //
      //   }
      // });
      return "Successful";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async addQuestionsToAppraisalSection(appraisalID: string, sectionID: string, dto: QuestionsDto, orgID: string) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        await tx.appraisal_Question.create({
          data: {
            text: dto.questions,
            response_type: dto.response_type,
            appraisal_SectionId: sectionID
          }
        });
        return "Created successfully";
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error creating question for appraisal. Contact Administrator");
    }
  }

  async findAllAppraisals(orgID: string) {
    try {
      return await this.prismaService.appraisal.findMany({
        where: {
          organizationId: orgID
        }
      });

    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async removeQuestionToAppraisalSection(sectionID: string, appraisalID: string, questionID: string) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const question = await tx.appraisal_Question.delete({
          where: {
            id: questionID
          }
        });
        return "Deleted successfully";
      });

    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findSectionQuestion(sectionID: string, questionID: string) {
    const found = await this.prismaService.appraisal_Question.findFirst({
      where: {
        id: questionID,
        appraisal_SectionId: sectionID
      }
    });

    if (!found) {
      const msg = `Question with id ${questionID} does not exist`;
      this.logger.error(msg);
      throw new AppNotFoundException(msg);
    }
    return found;
  }

  // async removeAppraisal(orgID: string, appraisalID: string) {
  //   try {
  //     await this.prismaService.appraisal.delete({
  //       where: {
  //         id: appraisalID
  //       }
  //     });
  //     return "Deleted Appraisal successfully";
  //   } catch (e) {
  //     this.logger.error(e);
  //     throw new AppException("Error removing appraisal");
  //   }
  // }


  async removeAppraisal(orgID: string, appraisalID: string) {
    try {
      await this.prismaService.$transaction(async (prisma) => {
        const appraisal = await prisma.appraisal.findUnique({
          where: { id: appraisalID }
        });
        if (!appraisal) {
          throw new AppException(`Appraisal with ID ${appraisalID} not found`);
        }
        await prisma.appraisal.delete({
          where: { id: appraisalID }
        });
      });
      return "Deleted Appraisal successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error removing appraisal");
    }
  }


  async sendAppraisalToAllStaff(dto: Appraisal, appraisalID: string, orgID: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const employees = await tx.employee.findMany({ where: { organizationId: orgID } });
        return await Promise.all(
          employees.map((employee) =>
            tx.employee_Appraisal.create({
              data: {
                appraisalId: appraisalID,
                employeeId: employee.id
              }
            })
          )
        );
      });

      return "sent successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException(e);
    }
  }

  async getMyAppraisal(employee) {
    try {
      return await this.prismaService.employee_Appraisal.findMany({
        where: {
          employeeId: employee.id
        },
        include:{
          appraisal:true
        }
      });


    } catch (e) {
      this.logger.error(e);
      throw new AppException(e);
    }
  }


}
