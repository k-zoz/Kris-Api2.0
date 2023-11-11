import { Injectable, Logger } from "@nestjs/common";
import { UtilService } from "@core/utils/util.service";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import {
  OrgEmpPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-emp-prisma-helper.service";
import {
  OrgTeamPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-team-prisma-helper.service";
import {
  OrgDeptPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-dept-prisma-helper.service";
import {
  ClientEmployeeOnboardRequest,
  CreateEmployeeDto,
  EmployeeOnboardRequest,
  EmployeeUpdateRequest,
  EmployeeWork, UpdateCertificateDto, UpdateEmployeeWork
} from "@core/dto/global/employee.dto";
import * as argon from "argon2";
import { LeaveService } from "@organization/leave/leave.service";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { EnumValues } from "enum-values";
import { BoStatusEnum, UserRoleEnum } from "@core/enum/user-role-enum";
import { CodeValue } from "@core/dto/global/code-value";
import { EmployeeRoleEnum } from "@core/enum/employee-role-enum";
import {
  OrgBranchPrismaHelperService
} from "@organization/org-prisma-helper-services/organization/org-branch-prisma-helper.service";
import {
  EmpClienteleHelperService
} from "@organization/org-prisma-helper-services/organization/emp-clientele-helper.service";
import { ConfirmInputPasswordDto } from "@core/dto/auth/user.dto";
import { AppConflictException, AppException } from "@core/exception/app-exception";
import { AuthPayload } from "@core/dto/auth/auth-payload.dto";
import { CloudinaryService } from "@cloudinary/cloudinary.service";
import { SearchRequest } from "@core/model/search-request";

@Injectable()
export class OrgEmployeeService {
  private readonly logger = new Logger(OrgEmployeeService.name);

  constructor(private readonly utilService: UtilService,
              private readonly orgHelperService: OrganizationPrismaHelperService,
              private readonly employeeService: EmployeePrismaHelperService,
              private readonly employeeHelperService: EmployeePrismaHelperService,
              private readonly orgEmployeeHelperService: OrgEmpPrismaHelperService,
              private readonly orgTeamHelperService: OrgTeamPrismaHelperService,
              private readonly orgDeptHelperService: OrgDeptPrismaHelperService,
              private readonly leaveService: LeaveService,
              private readonly orgBranchHelperService: OrgBranchPrismaHelperService,
              private readonly orgDepartmentHelperService: OrgDeptPrismaHelperService,
              private readonly orgClientHelperService: EmpClienteleHelperService,
              private readonly cloudinaryService: CloudinaryService
  ) {
  }


  //TODO turn email to small letters
  async onboardEmpToMyOrg(request: EmployeeOnboardRequest, orgID, creatorMail) {
    await this.orgEmployeeHelperService.validateRequest(request);
    const orgName = await this.orgHelperService.findOrgByID(orgID);
    const newPassword = this.utilService.generateRandomPassword();
    request.basic.email = this.utilService.toLowerCase(request.basic.email);
    request.basic.firstName = this.utilService.toUpperCase(request.basic.firstName);
    request.basic.lastName = this.utilService.toUpperCase(request.basic.lastName);
    request.work.employeeBranch = this.utilService.toUpperCase(request.work.employeeBranch);
    request.work.department = this.utilService.toUpperCase(request.work.department);
    request.work.empTeam = this.utilService.toUpperCase(request.work.empTeam);
    request.work.employeeClient = this.utilService.toUpperCase(request.work.employeeClient);
    request.work.dateOfConfirmation = this.utilService.convertDateAgain(request.work.dateOfConfirmation);
    request.work.dateOfJoining = this.utilService.convertDateAgain(request.work.dateOfJoining);
    request.basic.krisID = this.utilService.generateUUID(request.basic.firstName);
    const branch = await this.orgBranchHelperService.findBranchByName(request.work.employeeBranch, orgID);
    const department = await this.orgDepartmentHelperService.findDeptByNameAlone(request.work.department, orgID);
    //  const client = await this.orgClientHelperService.findClientByName(request.work.employeeClient, orgID);
    await this.orgTeamHelperService.findTeamByName(department.id, orgID, request.work.empTeam);
    await this.utilService.checkIfRoleIsManagement(request.work.employeeKrisRole);
    const employee = await this.employeeHelperService.createNewEmployeeAndSendWelcomeMail(request, newPassword, creatorMail, orgName);
    // //TODO leave, onboarding, appraisals for new employee
    await this.leaveService.onboardLeaveForNewEmployee(orgID, employee);
  }

  async onboardEmpToClient(request: ClientEmployeeOnboardRequest, orgID: string, email: string) {
    await this.orgEmployeeHelperService.validateRequest(request);
    const orgName = await this.orgHelperService.findOrgByID(orgID);
    const newPassword = this.utilService.generateRandomPassword();
    request.basic.email = this.utilService.toLowerCase(request.basic.email);
    request.basic.firstName = this.utilService.toUpperCase(request.basic.firstName);
    request.basic.lastName = this.utilService.toUpperCase(request.basic.lastName);
    request.clientWork.employeeClient = this.utilService.toUpperCase(request.clientWork.employeeClient);
    request.clientWork.dateOfConfirmation = this.utilService.convertDateAgain(request.clientWork.dateOfConfirmation);
    request.clientWork.dateOfJoining = this.utilService.convertDateAgain(request.clientWork.dateOfJoining);
    request.basic.krisID = this.utilService.generateUUID(request.basic.firstName);
    const client = await this.orgClientHelperService.findClientByName(request.clientWork.employeeClient, orgID);
    await this.utilService.checkIfRoleIsManagement(request.clientWork.employeeKrisRole);
    return await this.employeeHelperService.createNewEmployeeForClient(request, newPassword, email, orgName, client);

  }

  async updateEmployeeWorkInfo(dto: UpdateEmployeeWork, orgID: string, empID: string, modifierMail: string) {
    const orgName = await this.orgHelperService.findOrgByID(orgID);
    await this.employeeService.findEmpById(empID);
    dto.dateOfConfirmation = this.utilService.convertDateAgain(dto.dateOfConfirmation);
    dto.dateOfJoining = this.utilService.convertDateAgain(dto.dateOfJoining);
    dto.employeeBranch = this.utilService.toUpperCase(dto.employeeBranch);
    dto.department = this.utilService.toUpperCase(dto.department);
    dto.empTeam = this.utilService.toUpperCase(dto.empTeam);
    dto.payGroup = this.utilService.toUpperCase(dto.payGroup);
    return await this.employeeHelperService.updateEmployeeWorkDetails(dto, empID, orgName, modifierMail);
  }


  async addEmployeeToATeam(orgID, teamID, empID, deptID) {
    await this.employeeService.findEmpById(empID);
    await this.orgHelperService.findOrgByID(orgID);
    await this.orgTeamHelperService.findTeam(deptID, orgID, teamID);
    await this.orgEmployeeHelperService.checkIfEmpIsAlreadyTeamMember(empID, teamID);
    return await this.orgEmployeeHelperService.addEmpToTeam(empID, teamID);
  }

  async addEmpToDept(deptID, orgID, empID) {
    await this.employeeService.findEmpById(empID);
    await this.orgHelperService.findOrgByID(orgID);
    await this.orgDeptHelperService.findDept(deptID, orgID);
    await this.orgEmployeeHelperService.checkIfEmpIsAlreadyInDept(empID, deptID);
    return await this.orgEmployeeHelperService.addEmpToDept(empID, deptID);
  }

  async resetEmployeePassword(orgID, empID, modifierEmail) {
    await this.orgHelperService.findOrgByID(orgID);
    const employee = await this.employeeService.findEmpById(empID);
    await this.utilService.compareEmails(modifierEmail, employee.email);
    const newPassword = this.utilService.generateRandomPassword();
    return await this.orgHelperService.resetEmpPasswordAndSendResetMail(empID, modifierEmail, newPassword);
  }

  roles(): Array<CodeValue> {
    return EnumValues.getNamesAndValues(EmployeeRoleEnum).map(value => CodeValue.of(value.name, value.value as string));
  }

  empStatus() {
    return EnumValues.getNamesAndValues(BoStatusEnum).map(value => CodeValue.of(value.name, value.value as string));
  }


  async changeMyPassword(dto: ConfirmInputPasswordDto, email: string) {
    const employee = await this.employeeService.findEmpByEmail(email);
    if (!await this.validatePassword(employee, dto.current)) {
      throw new AppConflictException("Current password incorrect!");
    }
    return await this.orgEmployeeHelperService.changeMyPasswordAndSendEmail(dto, employee);
  }

  async validatePassword(user, password: string): Promise<boolean> {
    return await argon.verify(user.password, password);
  }

  async updateMyProfile(dto: EmployeeUpdateRequest, payload: AuthPayload) {
    const employee = await this.employeeService.findEmpByEmail(payload.email);
    dto.personal.dateOfBirth = this.utilService.convertDateAgain(dto.personal.dateOfBirth);
    return await this.orgEmployeeHelperService.updateMyProfile(dto, employee);
  }


  async bulkCreateEmployee(file: Express.Multer.File, creatorEmail: string) {
    const creator = await this.employeeHelperService.findEmpByEmail(creatorEmail);
    const organization = await this.orgHelperService.findOrgByID(creator.organizationId);
    const csvData = await this.cloudinaryService.readCSVFile(file);
    const employeeObj = await this.utilService.returnObjects(csvData);
    const employeeUploads = await this.utilService.updateKeysInObject(employeeObj);
    const assignedProperties = await this.utilService.assignProperties(employeeUploads, organization.id, creator.email);
    return await this.employeeHelperService.createManyEmployees(assignedProperties, employeeUploads, organization);

  }

  async bulkCreateClientEmployee(file: Express.Multer.File, creatorEmail: string) {
    const creator = await this.employeeHelperService.findEmpByEmail(creatorEmail);
    const organization = await this.orgHelperService.findOrgByID(creator.organizationId);
    const csvData = await this.cloudinaryService.readCSVFile(file);
    const employeeObj = await this.utilService.returnObjects(csvData);
    const employeeUploads = await this.utilService.updateKeysInObject(employeeObj);
    const clientName = employeeUploads[0].client;
    const clientNameUppercase = this.utilService.toUpperCase(clientName);
    const client = await this.orgClientHelperService.findClientByName(clientNameUppercase, organization.id);
    const assignedProperties = await this.utilService.assignClientEmployeeProperties(employeeUploads, organization.id, client.id, creator.email);
    return await this.employeeHelperService.createManyEmployees(assignedProperties, employeeUploads, organization);
  }

  async allOnboardedEmployees(orgID: string, dto: SearchRequest) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.employeeHelperService.allBulkCreatedEmployees(organization, dto);
  }


  async allEmployeesHrEmployees(orgID: string) {
    const organization = await this.orgHelperService.findOrgByID(orgID);
    return await this.employeeHelperService.hrEmployees(organization);
  }

  async uploadCertificate(dto: UpdateCertificateDto, email: string) {
    const employee = await this.employeeService.findEmpByEmail(email);
    return await this.employeeHelperService.uploadCert(employee, dto);
  }

  async myCertificates(email: string) {
    const employee = await this.employeeService.findEmpByEmail(email);
    return await this.employeeHelperService.certificatesAll(employee);
  }

  async deleteEmployeeCertificate(certificateID: string) {
    return await this.employeeHelperService.deleteCert(certificateID);
  }


}
