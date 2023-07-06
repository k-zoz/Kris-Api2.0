export enum UserRoleEnum {
  SUPER_ADMIN = "SUPER_ADMIN", ADMIN = "ADMIN", SUPPORT = "SUPPORT", STAFF = "STAFF",
}

export declare type UserRoleType = keyof typeof UserRoleEnum
