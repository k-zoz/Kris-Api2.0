import { Injectable } from "@nestjs/common";
import {
  PayrollPreviewHelperService
} from "@organization/org-prisma-helper-services/payroll/payroll-preview-helper.service";
import { CreatePayrollPreviewDto, EmployeePayrollPreviewDto } from "@core/dto/global/Payroll.dto";
import { OrganizationPrismaHelperService } from "@back-office/helper-services/organization-prisma-helper.service";
import { UtilService } from "@core/utils/util.service";
import { SearchRequest } from "@core/model/search-request";
import { EmployeePrismaHelperService } from "@back-office/helper-services/employee-prisma-helper.service";
import { Employee } from "@core/dto/global/employee.dto";

@Injectable()
export class PayrollPreviewService {
  constructor(private readonly payrollPreviewPrismaHelper: PayrollPreviewHelperService,
              private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly employeeHelperPrismaService: EmployeePrismaHelperService,
              private readonly utilService: UtilService
  ) {
  }


  async createPayrollPreview(dto: CreatePayrollPreviewDto, orgID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.name = this.utilService.toUpperCase(dto.name);
    dto.startDate = this.utilService.convertDateAgain(dto.startDate);
    dto.endDate = this.utilService.convertDateAgain(dto.endDate);
    dto.date = this.utilService.convertDateAgain(dto.date);
    await this.payrollPreviewPrismaHelper.validateRequest(dto);
    return await this.payrollPreviewPrismaHelper.createPayrollPreview(dto, orgID, email);
  }

  async allPayrollPreview(orgID: string, searchRequest: SearchRequest) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.payrollPreviewPrismaHelper.allPayrollPreview(orgID, searchRequest);
  }

  async addEmployeeToPayrollPreview(dto: Employee, orgID: string, payrollPreviewID, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    await this.payrollPreviewPrismaHelper.findPayrollPreviewById(orgID, payrollPreviewID);
    const employee = await this.employeeHelperPrismaService.findEmpById(dto.id);
    await this.payrollPreviewPrismaHelper.checkIfEmployeeIsAlreadyInPayrollPreview(employee.id, payrollPreviewID, orgID);
    return await this.payrollPreviewPrismaHelper.addEmployeeToPayrollPreview(employee.id, payrollPreviewID, orgID, email, employee);
  }


  async getOnePayrollPreviewById(orgID: string, payrollPreviewID: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    return await this.payrollPreviewPrismaHelper.findPayrollPreviewById(orgID, payrollPreviewID);
  }


  async removeEmployeeFromPayrollPreview(dto: Employee, orgID: string, payrollPreviewID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    await this.payrollPreviewPrismaHelper.findPayrollPreviewById(orgID, payrollPreviewID);
    const employee = await this.employeeHelperPrismaService.findEmpById(dto.id);
    await this.payrollPreviewPrismaHelper.findEmployeeInPayrollPreview(employee.id, payrollPreviewID, orgID);
    return await this.payrollPreviewPrismaHelper.disconnectEmployeeFromPayrollPreview(employee.id, payrollPreviewID, orgID, email, employee);
  }

  async updateEmployeePayrollPreviewInformation(dto: EmployeePayrollPreviewDto, orgID: string, payrollPreviewID: string, empID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);

    dto.employee_Pension = parseFloat(dto.employee_Pension);
    dto.employer_Pension = parseFloat(dto.employer_Pension);
    dto.employee_Pension = this.utilService.calculateEmployeePension(dto);
    dto.employer_Pension = this.utilService.calculateEmployerPension(dto);
    dto.deduction = this.utilService.calculateTotalDeductions(dto);
    dto.gross_pay = parseFloat(dto.gross_pay);
    dto.bonuses = parseFloat(dto.bonuses);
    dto.taxes = parseFloat(dto.taxes);
    dto.education = parseFloat(dto.education);
    dto.net_pay = parseFloat(dto.net_pay);
    dto.basic_salary = parseFloat(dto.basic_salary);
    dto.furniture = parseFloat(dto.furniture);
    dto.housing = parseFloat(dto.housing);
    dto.transportation = parseFloat(dto.transportation);
    dto.utility = parseFloat(dto.utility);
    dto.location = parseFloat(dto.location);
    await this.payrollPreviewPrismaHelper.findPayrollPreviewById(orgID, payrollPreviewID);
    const employee = await this.employeeHelperPrismaService.findEmpById(empID);
    await this.payrollPreviewPrismaHelper.findEmployeeInPayrollPreview(employee.id, payrollPreviewID, orgID);
    return await this.payrollPreviewPrismaHelper.updateEmployeeInfoInPayrollPreview(dto, employee.id, payrollPreviewID, orgID, email);
  }


  async deleteEmployeesFromPayrollPreview(orgID: string, payrollPreviewID: string, empID: string, email) {
    await this.organizationHelperService.findOrgByID(orgID);
    await this.payrollPreviewPrismaHelper.findPayrollPreviewById(orgID, payrollPreviewID);
    const employee = await this.employeeHelperPrismaService.findEmpById(empID);
    await this.payrollPreviewPrismaHelper.findEmployeeInPayrollPreview(employee.id, payrollPreviewID, orgID);
    return await this.payrollPreviewPrismaHelper.disconnectEmployeeFromPayrollPreview(employee.id, payrollPreviewID, orgID, email, employee);
  }
}
