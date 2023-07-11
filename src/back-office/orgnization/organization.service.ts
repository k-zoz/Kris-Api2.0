import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { CreateOrgDto } from "@core/dto/back-office/organization.dto";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { AppConst } from "@core/const/app.const";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async onboardOrganization(org: CreateOrgDto, creatorEmail: string) {
    await this.validateCreateDtoRequest(org);
    org.createdBy = creatorEmail;
    return this.saveOrganization(org);
  }


  async validateCreateDtoRequest(dto) {
    await this.checkPropertyExists("orgName", dto.orgName, "");
    await this.checkPropertyExists("orgWebsite", dto.orgWebsite, "Website");
    await this.checkPropertyExists("orgEmail", dto.orgEmail, "Email address");
    await this.checkPropertyExists("orgNumber", dto.orgNumber, "Phone number");
    await this.checkPropertyExists("orgRCnumber", dto.orgRCnumber, "RC Number");
  }

  async checkPropertyExists(propertyName, propertyValue, propertyDescription) {
    if (propertyValue) {
      const result = await this.prismaService.organization.findUnique({
        where: { [propertyName]: propertyValue }
      });
      if (result) {
        const errMsg = `${propertyDescription} ${result[propertyName]} already exists`;
        this.logger.error(errMsg);
        throw new AppConflictException(errMsg);
      }
    }
  }


  async saveOrganization(org) {
    try {
      const saved = await this.prismaService.organization.create({
        data: {
          orgName: org.orgName,
          orgEmail: org.orgEmail,
          orgNumber: org.orgNumber,
          orgWebsite: org.orgWebsite,
          orgRCnumber: org.orgRCnumber,
          orgAddress: org.orgAddress,
          orgState: org.orgState,
          orgCountry: org.orgCountry,
          orgIndustry: org.orgIndustry,
          createdBy: org.createdBy
        }
      });
      this.logger.log(`Organization ${saved.orgName} saved successfully`);
      return `${saved.orgName} saved successfully`;
    } catch (e) {
      const msg = `Error creating Organization ${org.orgName}`;
      this.logger.error(msg);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }


  async findOrgByID(id) {
    const found = await this.prismaService.organization.findFirst({ where: { id } });
    if (!found) {
      const msg = `Organization with id ${id} not found`;
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


