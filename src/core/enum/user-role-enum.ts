export enum UserRoleEnum {
  SUPER_ADMIN = "SUPER_ADMIN", SUPPORT = "SUPPORT", STAFF = "STAFF",
}

export declare type UserRoleType = keyof typeof UserRoleEnum


export enum BoStatusEnum {
  ACTIVE = "ACTIVE",
  LEAVE = "LEAVE",
  TERMINATED = "TERMINATED",
  DECEASED = "DECEASED",
  RESIGNED = "RESIGNED",
  PROBATION = "PROBATION",
  NOTICE_PERIOD = "NOTICE_PERIOD"
}

export declare type  BoStatusType = keyof typeof BoStatusEnum
