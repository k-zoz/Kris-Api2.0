import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import {
  AppraisalResponseDto,
  CreateAppraisalDto,
  CreateSectionsForAppraisal,
  QuestionsDto
} from "@core/dto/global/appraisal";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { Appraisal, Employee, Employee_Appraisal } from "@prisma/client";
import { AuthMsg } from "@core/const/security-msg-const";

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
      throw new AppException("Error creating question for appraisal.");
    }
  }

  async findAllAppraisals(orgID: string) {
    try {
      return await this.prismaService.appraisal.findMany({
        where: {
          organizationId: orgID
        }, orderBy: {
          createdDate: "desc"
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


  async checkIfEmployeesHaveAppraisal(appraisalID: string, orgID: string) {
    const employees = await this.prismaService.employee_Appraisal.findMany({
      where: { appraisalId: appraisalID }
    });

    if (employees.length > 0) {
      const msg = `Employees already have this appraisal`;
      this.logger.error(msg);
      throw new AppNotFoundException(msg);
    }
  }


  async sendAppraisalToAllStaff(dto: Appraisal, appraisalID: string, orgID: string, creatorEmail: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const employees = await tx.employee.findMany({ where: { organizationId: orgID } });
        return await Promise.all(
          employees.map((employee) =>
            tx.employee_Appraisal.create({
              data: {
                appraisalId: appraisalID,
                employeeId: employee.id,
                status: "PENDING",
                createdBy: creatorEmail
              }
            })
          )
        );
      });
      return "sent successfully";
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error sending appraisals to employee");
    }
  }

  async sendAppraisalToOneEmployee(employee: Employee, appraisal: Appraisal) {
    try {
      await this.prismaService.employee_Appraisal.create({
        data: {
          appraisalId: appraisal.id,
          status: "PENDING",
          employeeId: employee.id
        }
      });
      return "Successfully sent to employees";
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error sending appraisals to employee");
    }
  }


  async getAllMyAppraisals(employee) {
    try {
      return await this.prismaService.employee_Appraisal.findMany({
        where: {
          employeeId: employee.id
        },
        include: {
          appraisal: {
            include: {
              section: {
                include: {
                  question: true
                }
              }
            }
          }
        }
        // orderBy: {
        //   createdDate: "desc"
        // }
      });

    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error getting all appraisals");
    }
  }


  async findMyAppraisalById(myAppraisalID: string, empID: any) {
    const found = await this.prismaService.employee_Appraisal.findFirst({
      where: {
        id: myAppraisalID,
        employeeId: empID
      }
    });
    if (!found) {
      throw new AppNotFoundException(`Your appraisal with id ${myAppraisalID} does not exist`);
    }
    return found;
  }

  async findMyAppraisalAndSections(myAppraisalID: string, empID: any) {
    try {
      return await this.prismaService.employee_Appraisal.findUnique({
        where: {
          id: myAppraisalID

        },
        include: {
          appraisal: {
            include: {
              section: {
                include: {
                  question: true
                }
              }
            }
          }
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error getting all appraisals");
    }

  }

  async checkIfResponseHasAlreadyBeenGiven(myAppraisalID: string, sectionID: string, questionID: string) {
    const found = await this.prismaService.appraisal_Question_Response.findFirst({
      where: {
        sectionID: sectionID,
        questionID: questionID,
        employeeAppraisalId: myAppraisalID
      }
    });

    if (found) {
      throw new AppNotFoundException(`Response for this question has been recorded.`);
    }
  }

  async answerQuestionInMyAppraisal(dto: AppraisalResponseDto, myAppraisalID: string, sectionID: string, questionID: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        await tx.appraisal_Question_Response.create({
          data: {
            score: dto.rating,
            questionID: questionID,
            sectionID: sectionID,
            employeeAppraisalId: myAppraisalID
          }
        });
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error submitting answer");
    }
  }

  async addCommentsToMyAppraisal(dto: AppraisalResponseDto, sectionID: string, myAppraisalID: string, employee) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        await tx.appraisal_Question_Response.create({
          data: {
            comment: dto.appraiserComment,
            sectionID: sectionID,
            employeeAppraisalId: myAppraisalID
          }
        });
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error adding comments to appraisal");
    }
  }

  async completeMyAppraisal(myAppraisalID: string, employee) {
    try {
      await this.prismaService.employee_Appraisal.update({
        where: { id: myAppraisalID },
        data: { status: "APPROVED" }
      });
      return "C";
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error completing appraisal");
    }
  }

  async myResponses(myAppraisalID: string, myAppraisal: Employee_Appraisal) {
    try {
      const [myAppraisalSubmittedResponses] = await this.prismaService.$transaction([
        this.prismaService.appraisal.findUnique({
          where: {
            id: myAppraisal.appraisalId // replace with the actual appraisal ID
          },
          include: {
            section: {
              orderBy: {
                name: "asc" // order by section name
              },
              select: {
                name: true,
                question: {
                  orderBy: {
                    id: "asc" // order by question ID or any other field
                  },
                  select: {
                    text: true,
                    Appraisal_Question_Response: {
                      where: {
                        employeeAppraisalId: myAppraisalID // replace with the actual employee appraisal ID
                      },
                      select: {
                        score: true
                      },
                      orderBy: {
                        id: "asc" // order by response ID or any other field
                      }
                    }
                  }
                },
                Appraisal_Question_Response: {
                  where: {
                    comment: {
                      not: null
                    }
                  },
                  select: { comment: true },
                  orderBy: { sectionID: "asc" }
                }
              }
            }
          }
        })
      ]);
      return myAppraisalSubmittedResponses;
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error getting appraisal responses");
    }
  }


  async allAllpraisalAndResponses(employee: Employee) {
    try {
      return await this.prismaService.employee_Appraisal.findMany({
        where: {
          employeeId: employee.id
        },
        include: {
          appraisal: {
            include: {
              section: {
                select: {
                  name: true,
                  question: {
                    select: {
                      text: true,
                      Appraisal_Question_Response: {
                        where: {
                          // employeeAppraisalId: {
                          //   equals: employee.id
                          // }
                        },
                        select: {
                          text: true,
                          score: true
                        }
                      }
                    }
                  },
                  Appraisal_Question_Response: {
                    where: {
                      comment: {
                        not: null
                      }
                    },
                    select: { comment: true, score: true },
                    orderBy: { sectionID: "asc" }
                  }
                }
              }
            }
          }
        }
      });
      // return employeeAppraisals;
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error getting appraisal responses");
    }

  }


}
