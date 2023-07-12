export enum EmployeeRoleEnum {
  MANAGEMENT = "MANAGEMENT",
  HUMAN_RESOURCE = "HUMAN_RESOURCE",
  FINANCE = "FINANCE",
  REGULAR = "REGULAR"
}

export declare type EmployeeRoleType = keyof typeof EmployeeRoleEnum
