import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { CreateOrgDto, EditOrgDto } from "@core/dto/global/organization.dto";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { SearchRequest } from "@core/model/search-request";
import { CreateEmployeeDto } from "@core/dto/global/employee.dto";
import { OrganizationHelperService } from "@back-office/orgnization/helper-services/organization-helper.service";
import * as argon from "argon2";
import { EmployeeHelperService } from "@auth/helper-services/employee-helper.service";

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(private readonly prismaService: PrismaService,
              private readonly orgHelperService: OrganizationHelperService,
              private readonly employeeHelperService: EmployeeHelperService
  ) {
  }

  async onboardOrganization(org: CreateOrgDto, creatorEmail: string) {
    await this.orgHelperService.validateDtoRequest(org);
    org.createdBy = creatorEmail;
    return this.orgHelperService.saveOrganization(org);
  }


  async editOrganization(org: EditOrgDto, id, modifierMail: string) {
    await this.orgHelperService.validateDtoRequest(org);
    await this.findOrgByID(id);
    org.modifiedBy = modifierMail;
    return this.orgHelperService.updateOrg(id, org);
  }

  async createOrgEmployee(orgEmp: CreateEmployeeDto, orgID, creatorMail) {
    await this.employeeHelperService.validateRequest(orgEmp);
    await this.findOrgByID(orgID);
    orgEmp.createdBy = creatorMail;
    orgEmp.empPassword = await argon.hash(orgEmp.empPassword);
    const employee = await this.employeeHelperService.createEmployee(orgEmp, orgID);
    return this.employeeHelperService.findAndExcludeFields(employee);
  }

  async findOrgByID(id) {
    const found = await this.prismaService.organization.findFirst({
      where: { id },
      include: {
        team: true,
        department: true,
        leavePlan: true
      }
    });
    if (!found) {
      const msg = `Organization with id ${id} does not exist`;
      this.logger.error(msg);
      throw new AppNotFoundException(msg);
    }
    return found;
  }

  async findAllOrg(request: SearchRequest) {
    const { skip, take } = request;
    try {
      const [users, total] = await this.prismaService.$transaction([
          this.prismaService.organization.findMany({
            select: {
              id: true,
              orgName: true,
              orgEmail: true,
              orgWebsite: true,
              orgAddress: true,
              orgRCnumber: true
            },
            skip,
            take
          }),
          this.prismaService.organization.count()
        ]
      );
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, users };
    } catch (e) {
      this.logger.error(AppException);
      throw new AppException();
    }

  }

}

