import { Injectable, Logger } from "@nestjs/common";
import {
  AppConflictException,
  AppException,
  AppNotFoundException,
  AppUnauthorizedException
} from "@core/exception/app-exception";
import { PrismaService } from "@prisma/prisma.service";
import {
  CreateTeamInDepartmentDto,
  DepartmentNameSearchDto,
  SearchBranchNameOrCodeDto
} from "@core/dto/global/organization.dto";
import { Department, Employee, Org_Branch, Organization } from "@prisma/client";
import { SearchRequest } from "@core/model/search-request";
import { HODConfirmationEvent, LeaveApplicationEvent } from "@core/event/back-office-event";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "@alert/email/email.service";

@Injectable()
export class OrgDeptPrismaHelperService {
  private readonly logger = new Logger(OrgDeptPrismaHelperService.name);
  private readonly mailSource = this.configService.get("mailSender");
  private resend: Resend;

  constructor(private readonly prismaService: PrismaService,
              private readonly configService: ConfigService,
              private readonly emailService: EmailService) {
    const resendKey = this.configService.get("resendApiKey");
    this.resend = new Resend(resendKey);
  }

  async findDeptDuplicates(dto, branchID) {
    const existingDept = await this.prismaService.department.findFirst({
      where: {
        name: {
          equals: dto.name
        },
        org_BranchId: branchID
      }
    });
    if (existingDept) {
      throw new AppConflictException(`Department  ${dto.name} exists in the branch already`);
    }
  }


  async addDepartmentToBranch(dto, branch, orgID, creatorEmail) {
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const department = await tx.department.create({
          data: {
            name: dto.name,
            createdBy: creatorEmail,
            organizationId: orgID,
            org_BranchId: branch.id
          }
        });
        return "Created Successfully";
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error creating department");
    }
  }


  async findDept(deptId, orgID) {
    const department = await this.prismaService.department.findFirst({
      where: {
        id: deptId,
        organizationId: orgID
      }
    });

    if (!department) {
      throw  new AppNotFoundException(`Can't find department with id ${deptId} `);
    }
    return department;
  }



  async softRemoveDeptFromOrg(orgID, deptID) {
    try {
      await this.prismaService.department.update({
        where: {
          id: deptID
        },
        data: {
          organizationId: orgID
        }
      });
      return "Action Successful";
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findAllDepts(orgID, request) {
    const { skip, take } = request;
    try {
      const [departments, total] = await this.prismaService.$transaction([
        this.prismaService.department.findMany({
          where: {
            organizationId: orgID
          }, include: {
            teams: true,
            Org_Branch: true
          },
          skip,
          take

        }),
        this.prismaService.department.count({
          where: {
            organizationId: orgID
          }
        })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, departments };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async findDeptByName(dto: any, orgID) {
    const department = await this.prismaService.department.findFirst({
      where: {
        name: dto.departmentName,
        organizationId: orgID
      }
    });

    if (!department) {
      throw new AppNotFoundException(`Can't find Department with name ${dto.departmentName} `);
    }
    return department;
  }


  async findDeptByNameAlone(departmentName, orgID) {
    if (!departmentName) {
    } else {
      const department = await this.prismaService.department.findFirst({
        where: {
          name: departmentName,
          organizationId: orgID
        }
      });

      if (!department) {
        throw new AppNotFoundException(`Can't find Department with name ${departmentName} `);
      }
      return department;
    }

  }

  async findAllDeptsInBranch(orgID: string, searchRequest: SearchBranchNameOrCodeDto) {
    const { skip, take } = searchRequest;
    try {
      const [departments, total] = await this.prismaService.$transaction([
        this.prismaService.department.findMany({
          where: {
            organizationId: orgID,
            Org_Branch: {
              name: searchRequest.name,
              branch_code: searchRequest.branch_code
            }
          },
          skip,
          take

        }),
        this.prismaService.department.count({
          where: {
            organizationId: orgID,
            Org_Branch: {
              name: searchRequest.name
            }
          }
        })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, departments };
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error getting");
    }
  }

  async allEmployeesInDepartment(orgID: string, deptID: string) {
    try {
      return await this.prismaService.employee.findMany({
        where: { departmentId: deptID },
        select: {
          firstname: true,
          lastname: true,
          email: true,
          krisID: true,
          workPhoneNumber: true,
          designation: true
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async isEmployeeAMemberOfDepartment(employee: Employee, department: Department) {
    if (employee.departmentId !== department.id) {
      throw new AppNotFoundException("Employee does not belong to department!");
    }
  }

  async makeEmployeeHOD(employee: Employee, department: Department, organization?: Organization) {
    try {
      await this.prismaService.$transaction(async (tx) => {

        await tx.department.update({
          where: { id: department.id },
          data: {
            //   departmentManagerID: employee.id,
            departmentManager: {
              connect: {
                id: employee.id
              }
            }
          }
        });

        try {
          const html = await this.emailService.sendHODConfirmationEmail({
            organizationName: organization.orgName,
            departmentName: department.name,
            employeeFirstName: employee.firstname
          } as HODConfirmationEvent);
          await this.resend.emails.send({
            from: `${this.mailSource}`,
            to: `${employee.email}`,
            subject: "Department Head Confirmation",
            html: `${html}`
          });
          this.logger.log(`Email Successfully sent to ${employee.email}`);
        } catch (e) {
          this.logger.error(e);
          throw new AppException("Error sending email");
        }
      }, { maxWait: 5000, timeout: 10000 });
      return `${employee.firstname} is now the head of department`;
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error making employee head of department ");
    }
  }

  async confirmIfEmployeeIsHeadOfDepartment(employee: Employee, department: Department) {
    if (department.departmentManagerID !== employee.id) {
      throw new AppUnauthorizedException("Not the head of department!");
    }
  }

  async removeEmployeeAsHOD(employee: Employee, department: Department) {
    try {
      await this.prismaService.$transaction(async (tx) => {
        // Update the employee to remove their managed department
        await this.prismaService.employee.update({
          where: { id: employee.id },
          data: {
            hierarchy_position: null,
            departmentManaging: {
              disconnect: true
            }
          }
        });

        // Update the branch to remove its department manager
        await this.prismaService.department.update({
          where: { id: department.id },
          data: {
            departmentManagerID: null
          }
        });
      });
      return `${employee.firstname} is no longer the head of department`;
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error removing employee as head of department");
    }
  }

  async getAllHeadOfDepartments(orgID: string, searchRequest: SearchRequest) {
    const { skip, take } = searchRequest;
    try {
      const [headOfDepartments, total] = await this.prismaService.$transaction([
        this.prismaService.department.findMany({
          where: {
            departmentManagerID: {
              not: null
            }
          },
          select: {
            departmentManager: {
              select: {
                firstname: true,
                lastname: true,
                email: true,
                designation: true,
                idNumber: true,
                workPhoneNumber: true
              }
            }
          },

          skip,
          take

        }),
        this.prismaService.department.count({
          where: {
            departmentManagerID: {
              not: null
            }
          }
        })
      ]);
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, headOfDepartments };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async getAllDepartmentsInBranch(branch: Org_Branch, orgID: string) {
    try {
      const [departments, total, departmentNumbers] = await this.prismaService.$transaction([
        this.prismaService.department.findMany({
          where: {
            organizationId: orgID,
            org_BranchId: branch.id
          },
          include: {
            departmentManager: {
              select: {
                firstname: true,
                lastname: true,
                email: true,
                designation: true
              }
            }
          }
        }),
        this.prismaService.department.count({
          where: {
            organizationId: orgID,
            org_BranchId: branch.id
          }
        }),

        this.prismaService.department.findFirst({
          where: {
            organizationId: orgID,
            org_BranchId: branch.id
          }, select: {
            _count: true
          }

        })
      ]);
      return { departments, total, departmentNumbers };
    } catch (e) {
      this.logger.error(e);
      throw new AppException();
    }
  }

  async checkIfEmployeeHasADepartment(employee: Employee) {
    if (!employee.departmentId) {
      throw new AppNotFoundException("Employee does not belong to department!");
    }
  }

  async allDepartmentRequests(employee: Employee, department: Department) {
    try {
      return await this.prismaService.deptRequestsAndApproval.findMany({
        where: {
          department: {
            id: department.id
          }
        },
        include: {
          leaveApprovalRequest: true
        },
        orderBy: {
          createdDate: "desc"
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw new AppException("Error getting all team requests");
    }
  }
}
