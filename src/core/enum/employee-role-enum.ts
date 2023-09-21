export enum EmployeeRoleEnum {
  MANAGEMENT = "MANAGEMENT",
  HUMAN_RESOURCE = "HUMAN_RESOURCE",
  FINANCE = "FINANCE",
  REGULAR = "REGULAR",
}

export declare type EmployeeRoleType = keyof typeof EmployeeRoleEnum


export enum EmployeeHierarchyEnum {
  BRANCH_MANAGER = "BRANCH_MANAGER",
  HEAD_OF_DEPARTMENT = "HEAD_OF_DEPARTMENT",
  TEAM_LEAD = "TEAM_LEAD"
}

export declare type EmployeeHierarchyType = keyof  typeof EmployeeHierarchyEnum
