import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { OnboardingDto } from "@core/dto/global/onboarding";
import { AppException, AppNotFoundException } from "@core/exception/app-exception";
import { AuthMsg } from "@core/const/security-msg-const";

@Injectable()
export class OrgOnboardPrismaHelperService {
  private readonly logger = new Logger(OrgOnboardPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async createOnboardingDoc(dto: OnboardingDto, orgID: string, email: string) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const employees = await tx.employee.findMany({
          where: {
            organizationId: orgID
          }
        });
        const onboardingDocuments = await Promise.all(
          employees.map((employee) =>
            tx.onboarding.create({
              data: {
                name: dto.name,
                description: dto.description,
                organizationId: orgID,
                employeeOnboard: {
                  create: {
                    employeeId: employee.id,
                    name: dto.name,
                    description: dto.description
                  }
                }
              }
            })
          )
        );
      });
      this.logger.log("Successfully Created onboarding");
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async createOnboardingDocuments(dto: OnboardingDto, orgID: string, email: string) {
    try {
      const onboarding = await this.prismaService.onboarding.create({
        data: {
          name: dto.name,
          description: dto.description,
          createdBy: email,
          organizationId: orgID
        }
      });
      this.logger.log("Successfully Created onboarding");
      return "Successfully created onboarding documents";
    } catch (e) {
      this.logger.error("Error creating onboarding documents");
      throw new AppException();
    }
  }

  async findAllOnboarding(orgID: string) {
    try {
      return await this.prismaService.onboarding.findMany({
        where: {
          Organization: { id: orgID }
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppNotFoundException();
    }
  }

  async findMyOnboardingDocuments(employee) {
    try {
      return await this.prismaService.employeeOnboarding.findMany({
        where: {
          employeeId: employee.id
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppNotFoundException();
    }
  }

  async findOnboardingByName(dto: OnboardingDto, orgID: string) {
    const onboarding = await this.prismaService.onboarding.findFirst({
      where: {
        name: dto.name,
        organizationId: orgID
      }
    });

    if (!onboarding) {
      throw  new AppNotFoundException(`Onboarding ${dto.name} does not exist`);
    }
    return onboarding;
  }

  async createOnboardingForNewEmployees(dto: OnboardingDto, onboarding, email: string, orgID) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - 14);
      await this.prismaService.$transaction(async (tx) => {
          // Get all employees whose profiles were created within the last 14 days
          const oldEmployees = await tx.employee.findMany({
            where: {
              createdDate: {
                gte: date
              }
            }
          });

          // Create an Onboarding record for each employee
          return await Promise.all(
            oldEmployees.map((employee) =>
              tx.onboarding.update({
                where: { id: onboarding.id }, data: {
                  employeeOnboard: {
                    create: { employeeId: employee.id, name: onboarding.name, description: onboarding.description, createdBy:email }
                  }
                }
              })
            )
          );
        }
      );
    } catch (e) {
      this.logger.error(e);
      throw new AppNotFoundException();
    }
  }

  async createOnboardingForALLEmployees(dto: OnboardingDto, onboarding, email: string, orgID) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const employees = await tx.employee.findMany({
          where: { organizationId: orgID }
        });
        const onboardingEmployees = await Promise.all(
          employees.map((employee) =>
            tx.employeeOnboarding.create({
              data: {
                name: onboarding.name,
                description: onboarding.description,
                createdBy: email,
                employeeId: employee.id
              }
            })
          ));
      });
      this.logger.log("successfully sent onboarding to all employees");
      return "Sucessfully sent to all employees";
    } catch (e) {
      this.logger.error(e);
      throw new AppNotFoundException();
    }
  }
}
