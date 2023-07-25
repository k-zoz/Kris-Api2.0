import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { AppConst } from "@core/const/app.const";


@Injectable()
export class OrganizationPrismaHelperService {
  private readonly logger = new Logger(OrganizationPrismaHelperService.name);

  constructor(private readonly prismaService: PrismaService) {}

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
      return saved;
    } catch (e) {
      const msg = `Error creating Organization ${org.orgName}`;
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }

  async updateOrg(id, org) {
    try {
      return await this.prismaService.organization.update({
        where: { id },
        data: {
          ...org
        }
      });
    } catch (e) {
      const msg = `Error updating Organization ${org.orgName}`;
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }



  //For the Organization model in prisma.
  //All the properties to be checked here are unique properties, so it checks to see if these unique properties have already been taken.
  //Property name a.k.a first argument in the checkEmpPropertyExists function must tally with how the name is saved in the Organization model in prisma.
  async validateDtoRequest(dto) {
    await this.checkOrgPropertyExists("orgName", dto.orgName, "");
    await this.checkOrgPropertyExists("orgWebsite", dto.orgWebsite, "Website");
    await this.checkOrgPropertyExists("orgEmail", dto.orgEmail, "Email address");
    await this.checkOrgPropertyExists("orgNumber", dto.orgNumber, "Phone number");
    await this.checkOrgPropertyExists("orgRCnumber", dto.orgRCnumber, "RC Number");
  }

  async checkOrgPropertyExists(propertyName, propertyValue, propertyDescription) {
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

  async findAllOrganizations(request){
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
