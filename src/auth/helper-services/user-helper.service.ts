import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException } from "@core/exception/app-exception";
import { UpdateBackOfficeProfile, UserDto } from "@core/dto/auth/user.dto";
import * as argon from "argon2";
import { AppConst } from "@core/const/app.const";

@Injectable()
export class UserHelperService {
  private readonly logger = new Logger(UserHelperService.name)

  constructor(private readonly prismaService:PrismaService) {}


  //For the User model in prisma.
  //All the properties to be checked here are unique properties, so it checks to see if these unique properties have already been taken.
  //Property name a.k.a first argument in the checkEmpPropertyExists function must tally with how the name is saved in the User model in prisma.
  async validateRequest(dto) {
    await this.checkUserPropertyExists("phoneNumber", dto.phoneNumber, "Phone number");
    await this.checkUserPropertyExists("email", dto.email, "Email address");
  }

  async checkUserPropertyExists(propertyName, propertyValue, propertyDescription) {
    if (propertyValue) {
      const result = await this.prismaService.user.findUnique({
        where: { [propertyName]: propertyValue }
      });
      if (result) {
        const errMsg = `${propertyDescription} ${result[propertyName]} already exists`;
        this.logger.error(errMsg);
        throw new AppConflictException(errMsg);
      }
    }
  }

  async editUser(email, profile: UpdateBackOfficeProfile) {
    const { authPayload, ...restProfile } = profile;
    try {
      return await this.prismaService.user.update({
        where: { email },
        data: {
          email: profile.email,
          firstname: profile.firstname,
          surname: profile.surname,
          phoneNumber: profile.phoneNumber,
          password: await argon.hash(profile.password)
        }
      });
    } catch (e) {
      const msg = `Error updating profile`;
      this.logger.error(msg);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }

  async changeRole(email: string, modifiedBy: string, role) {
    try {
      const saved = await this.prismaService.user.update({
        where: { email },
        data: {
          role,
          modifiedBy,
          version: { increment: 1 }
        }
      });
      this.logger.log(`User ${saved.email} role changed successfully`);
      return `User ${saved.email} role changed successfully`;
    } catch (e) {
      const msg = `Error changing  ${email} password`;
      this.logger.error(msg);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }

  async changePassword(email: string, modifiedBy: string, newPassword: string) {
    try {
      const saved = await this.prismaService.user.update({
        where: { email },
        data: {
          password: await argon.hash(newPassword),
          modifiedBy,
          version: { increment: 1 }
        }
      });
      this.logger.log(`User ${saved.email} password changed successfully`);
      return `User ${saved.email} password changed successfully`;
    } catch (e) {
      const msg = `Error changing  ${email} password`;
      this.logger.error(msg);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }

  async saveNewUser(user: UserDto): Promise<any> {
    try {
      const saved = await this.prismaService.user.create({
        data: {
          email: user.email,
          firstname: user.firstname,
          surname: user.surname,
          phoneNumber: user.phoneNumber,
          role: user.role,
          password: await argon.hash(user.password),
          createdBy: user.createdBy
        }
      });
      this.logger.log(`User ${user.email} saved successfully`);
      return `User ${user.email} saved successfully`;
    } catch (e) {
      const msg = `Error creating user ${user.email}`;
      this.logger.error(msg);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }


  async saveUser(user: UserDto): Promise<any> {
    try {
      const saved = await this.prismaService.user.create({
        data: {
          email: user.email,
          firstname: user.firstname,
          surname: user.surname,
          phoneNumber: user.phoneNumber,
          role: user.role,
          password: await argon.hash(user.password),
          createdBy: user.createdBy
        }
      });
      this.logger.log(`User ${user.email} saved successfully`);
      return saved;
    } catch (e) {
      const msg = `Error creating user ${user.email}`;
      this.logger.error(msg);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }
}
