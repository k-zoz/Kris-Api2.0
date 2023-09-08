import { Injectable, Logger } from "@nestjs/common";
import { PostJobDto } from "@core/dto/global/Jobs.dto";
import { AppException } from "@core/exception/app-exception";
import { PrismaService } from "@prisma/prisma.service";

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
          yoe: dto.yoe,
          type: dto.type,
          skill_set: dto.skill_set,
          location: dto.location,
          information: dto.information,
          searchEndDate: dto.searchEndDate,
          qualification: dto.qualification,
          createdBy: email,
          salary_range: dto.salary_range,
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
            Organization: true
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
}
