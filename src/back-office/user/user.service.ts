import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as argon from "argon2";
import { ConfirmInputPasswordDto, CreateSuperUserDto, UpdateBackOfficeProfile } from "@core/dto/auth/user.dto";
import { UtilService } from "@core/utils/util.service";
import { BoStatusEnum, UserRoleEnum } from "@core/enum/user-role-enum";
import { SearchRequest } from "@core/model/search-request";
import { CodeValue } from "@core/dto/global/code-value";
import { EnumValues } from "enum-values";
import { UserPrismaHelperService } from "@back-office/helper-services/user-prisma-helper.service";
import { AppConflictException, AppUnauthorizedException } from "@core/exception/app-exception";
import { ConfigService } from "@nestjs/config";



@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly utilService: UtilService,
              private readonly userHelperService: UserPrismaHelperService,
              private readonly configService:ConfigService,
  ) {
  }

  async onModuleInit(): Promise<void> {
    await this.createSuperUser();
  }

  async createSuperUser() {
    const superUserExists = await this.userHelperService.findSuperUserUser("rootadmin@kris.io");
    if (!superUserExists) {
      const superUserDTO = {

        email: this.configService.get<string>("baseUserEmail"),
        firstname: "Root",
        surname: "Admin",
        phoneNumber: "01001111111",
        password: this.configService.get<string>("baseUserPassword"),
        role: "SUPER_ADMIN",
        krisID: "KR-0001",
        status: "ACTIVE",
        createdBy: this.configService.get<string>("baseUserEmail"),
        authPayload: { email: this.configService.get<string>("baseUserEmail"), role: "SUPER_ADMIN" }
      } as CreateSuperUserDto;
      await this.userHelperService.saveSuperUser(superUserDTO);
      this.logger.log(`SUPER ADMIN CREATED SUCCESSFULLY<>$$$$$$$`);
    }
  }

  async onboardBackOfficeUser(dto: CreateSuperUserDto, creatorEmail?: string) {
    await this.userHelperService.validateRequest(dto);
    dto.createdBy = creatorEmail;
    dto.firstname = this.utilService.toUpperCase(dto.firstname)
    dto.surname = this.utilService.toUpperCase(dto.surname)
    dto.krisID = this.utilService.generateUUID(dto.firstname)
    dto.password = this.utilService.generateRandomPassword();
    return this.userHelperService.saveNewUserndSendEmail(dto);
  }

  //TODO generate random password
  //TODO get the email from the created profile and the generated password and send as mail

  async editProfile(userID: string, dto: UpdateBackOfficeProfile) {
    await this.userHelperService.validateRequest(dto);
    return this.userHelperService.editUser(userID, dto);
    //TODO make change password different
    //TODO remove change email, make it different
    //TODO change response
  }

  async changeUserRole(modifierMail: string, id: string, role: string) {
    const user = await this.userHelperService.findUserById(id);
    const modifier = await this.userHelperService.findByEmail(modifierMail);
    await this.utilService.compareEmails(user.email, modifier.email);
    await this.userHelperService.changeRole(user.email, modifier.email, role);
    return `User ${user.email} role is updated successfully`;
  }

  async checkUserPassword(dto: ConfirmInputPasswordDto, userId: string) {
    const user = await this.userHelperService.findUserById(userId);
    const user1 = await this.userHelperService.findByEmail(user.email);
    if(!await this.validatePassword(user1, dto.current)){
      throw new AppConflictException("current password incorrect!")
    }
    return await this.userHelperService.changePasswordAndSendPasswordChangeEmail(user1.email, user1.email, dto.newPassword, user1)
  }

  async changeUserPassword(modifierMail: string, id: string, newPassword: string) {
    const user = await this.userHelperService.findUserById(id);
    const modifier = await this.userHelperService.findByEmail(modifierMail);
    return await this.userHelperService.changePasswordAndSendPasswordChangeEmail(user.email, modifier.email, newPassword);
  }

  async resetUserPassword(reseterEmail, userID) {
    const user = await this.userHelperService.findUserById(userID);
    await this.utilService.compareEmails(reseterEmail, user.email);
    const newPassword = this.utilService.generateRandomPassword();
    return await this.userHelperService.resetBOPasswordAndSendResetMail(userID, reseterEmail, newPassword);
  }

  async validatePassword(user, password: string): Promise<boolean> {
    return await argon.verify(user.password, password);
  }


  async findAllUsers(request: SearchRequest) {
    return await this.userHelperService.findAllBackOfficeUsers(request);
  }

  roles(): Array<CodeValue> {
    return EnumValues.getNamesAndValues(UserRoleEnum).map(value => CodeValue.of(value.name, value.value as string));
  }

  boStatus() {
    return EnumValues.getNamesAndValues(BoStatusEnum).map(value => CodeValue.of(value.name, value.value as string));
  }
}
