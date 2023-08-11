import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { AppConflictException, AppException, AppNotFoundException } from "@core/exception/app-exception";
import { UpdateBackOfficeProfile, UserDto } from "@core/dto/auth/user.dto";
import * as argon from "argon2";
import { AppConst } from "@core/const/app.const";
import { prismaExclude } from "@prisma/prisma-utils";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NewBackOfficerEvent } from "@core/event/back-office-event";
import { KrisEventConst } from "@core/event/kris-event.const";
import { EmailService } from "../../alert/email/email.service";
import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UserPrismaHelperService {
  private readonly logger = new Logger(UserPrismaHelperService.name);
  private readonly mailSource = this.configService.get("mailSender");

  constructor(private readonly prismaService: PrismaService,
              private readonly eventEmitter: EventEmitter2,
              private readonly mailerService: MailerService,
              private readonly configService: ConfigService
  ) {
  }


  async findSuperUserUser(email: string) {
    return this.prismaService.user.findUnique({ where: { email: "rootadmin@kris.io" } });
  }

  async findUserById(id: string) {
    const found = await this.prismaService.user.findFirst({ where: { id } });
    if (!found) {
      const msg = `User with id ${id} not found`;
      this.logger.error(msg);
      throw new AppNotFoundException(msg);
    }
    return this.findAndExcludeFields(found);
  }

  async findAndExcludeFields(user) {
    return this.prismaService.user.findUniqueOrThrow({
      where: { email: user.email },
      select: prismaExclude("User", ["password", "version", "refreshToken"])
    });
  }

  async findAndExcludeFieldDuringSignUp(user) {
    return this.prismaService.user.findUniqueOrThrow({
      where: { email: user.email },
      select: prismaExclude("User", ["password", "refreshToken", "phoneNumber", "createdBy", "createdDate", "version", "modifiedBy", "modifiedDate"])
    });
  }

  async findFirst(email: string) {
    const user = await this.prismaService.user.findFirst({ where: { email } });
    if (!user) {
      const errMessage = `Invalid Email or Password`;
      this.logger.error(errMessage);
      throw new AppNotFoundException(errMessage);
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) {
      const errMessage = `Email ${email} not found`;
      this.logger.error(errMessage);
      throw new AppNotFoundException(errMessage);
    }
    return user;
  }

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
      this.logger.error(e);
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
      this.logger.error(e);
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
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }

  // async saveNewUser(user: UserDto): Promise<any> {
  //   try {
  //     const saved = await this.prismaService.user.create({
  //       data: {
  //         email: user.email,
  //         firstname: user.firstname,
  //         surname: user.surname,
  //         phoneNumber: user.phoneNumber,
  //         role: user.role,
  //         password: await argon.hash(user.password),
  //         createdBy: user.createdBy
  //       }
  //     });
  //
  //     this.newBackOfficerEvent({
  //       email: saved.email,
  //       password: user.password,
  //       firstname: saved.firstname,
  //       template:"welcomeBo"
  //     } as NewBackOfficerEvent);
  //     this.logger.log(`User ${user.email} saved successfully`);
  //     return `User ${user.email} saved successfully`;
  //   } catch (e) {
  //     const msg = `Error creating user ${user.email}`;
  //     this.logger.error(e);
  //     throw new AppConflictException(AppConst.error, { context: msg });
  //   }
  // }

  async saveNewUserndSendEmail(user: UserDto): Promise<any> {
    try {
      await this.prismaService.$transaction(async (tx) => {
        const saved = await tx.user.create({
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

        await this.mailerService.sendMail({
          from: this.mailSource,
          to: saved.email,
          subject: "Welcome to KRIS",
          template: "welcomeBo",
          context: {
            event: {
              email: saved.email,
              password: user.password,
              firstname: saved.firstname
            }
          }
        });
        return `Email Successfully sent to ${saved.email}`
      });
      this.logger.log(`User ${user.email} saved successfully`);
      return `User ${user.email} saved successfully`;
    } catch (e) {
      const msg = `Error creating user ${user.email}`;
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }


  async saveSuperUser(user: UserDto): Promise<any> {
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
      this.logger.error(e);
      throw new AppConflictException(AppConst.error, { context: msg });
    }
  }

  async setUserRefreshToken(email: string, refreshToken) {
    await this.prismaService.user.update({
      where: { email },
      data: {
        refreshToken
      }
    });
  }

  async findAllBackOfficeUsers(request) {
    const { skip, take } = request;

    try {
      const [users, total] = await this.prismaService.$transaction([
          this.prismaService.user.findMany({
            select: {
              id: true,
              surname: true,
              firstname: true,
              phoneNumber: true,
              email: true,
              role: true
            },
            skip,
            take
          }),
          this.prismaService.user.count()
        ]
      );
      const totalPage = Math.ceil(total / take) || 1;
      return { total, totalPage, users };
    } catch (e) {
      this.logger.error(AppException);
      throw new AppException();
    }
  }

  private newBackOfficerEvent(event: NewBackOfficerEvent) {
    this.eventEmitter.emit(KrisEventConst.createEvents.boUser, event);
  }

}
