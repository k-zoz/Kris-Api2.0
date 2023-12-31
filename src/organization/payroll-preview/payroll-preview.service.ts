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
import { CloudinaryService } from "@cloudinary/cloudinary.service";

@Injectable()
export class PayrollPreviewService {
  constructor(private readonly payrollPreviewPrismaHelper: PayrollPreviewHelperService,
              private readonly organizationHelperService: OrganizationPrismaHelperService,
              private readonly employeeHelperPrismaService: EmployeePrismaHelperService,
              private readonly utilService: UtilService,
              private readonly cloudinaryService: CloudinaryService
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

  //TODO rewrite the logic for bulk upload

  async updateEmployeePayrollPreviewInformation(dto: EmployeePayrollPreviewDto, orgID: string, payrollPreviewID: string, empID: string, email: string) {
    await this.organizationHelperService.findOrgByID(orgID);
    dto.basic_salary = parseFloat(dto.basic_salary);
    dto.housing = parseFloat(dto.housing);
    dto.transportation = parseFloat(dto.transportation);
    //  dto.education = parseFloat(dto.education);
    // dto.location = parseFloat(dto.location);
    dto.furniture = parseFloat(dto.furniture);
    dto.utility = parseFloat(dto.utility);
    dto.taxes = parseFloat(dto.taxes);
    // dto.gross_pay = this.utilService.calculateEmpGrossPay(dto);
    dto.gross_pay = parseFloat(dto.gross_pay);
    // dto.employee_Pension = this.utilService.calculateEmployeePension(dto);
    dto.employee_Pension = parseFloat(dto.employee_Pension);
    //  dto.employer_Pension = this.utilService.calculateEmployerPension(dto);
    // dto.employer_Pension = parseFloat(dto.employer_Pension);
    //  dto.empITF = this.utilService.calculateITF(dto);
    // dto.empITF = parseFloat(dto.empITF);
    //  dto.empNHF = this.utilService.calculateNHF(dto);
    // dto.empNHF = parseFloat(dto.empNHF);
    //  dto.empNSITF = this.utilService.calculateNSITF(dto);
    //   dto.empNSITF = parseFloat(dto.empNSITF);
    // dto.deduction = this.utilService.calculateTotalDeductions(dto);
    dto.deduction = parseFloat(dto.deduction);
    // dto.net_pay = this.utilService.calculateEmpNetPay(dto);
    dto.net_pay = parseFloat(dto.net_pay);
    dto.bonuses = this.utilService.useToReturnNull();
    dto.payroll_net = parseFloat(dto.payroll_net);
    dto.other_deductions = parseFloat(dto.other_deductions);
    dto.reimbursable = parseFloat(dto.reimbursable);
    dto.special_allowance = parseFloat(dto.special_allowance);
    dto.entertainment = parseFloat(dto.entertainment);
    await this.payrollPreviewPrismaHelper.findPayrollPreviewById(orgID, payrollPreviewID);
    const employee = await this.employeeHelperPrismaService.findEmpById(empID);
   // await this.payrollPreviewPrismaHelper.findEmployeeInPayrollPreview(employee.id, payrollPreviewID, orgID);
    return await this.payrollPreviewPrismaHelper.updateEmployeeInfoInPayrollPreview(dto, employee.id, payrollPreviewID, orgID, email);
  }


  async deleteEmployeesFromPayrollPreview(orgID: string, payrollPreviewID: string, empID: string, email) {
    await this.organizationHelperService.findOrgByID(orgID);
    await this.payrollPreviewPrismaHelper.findPayrollPreviewById(orgID, payrollPreviewID);
    const employee = await this.employeeHelperPrismaService.findEmpById(empID);
    await this.payrollPreviewPrismaHelper.findEmployeeInPayrollPreview(employee.id, payrollPreviewID, orgID);
    return await this.payrollPreviewPrismaHelper.disconnectEmployeeFromPayrollPreview(employee.id, payrollPreviewID, orgID, email, employee);
  }

  async bulkUploadEmployeePayroll(orgID: string, payrollPreviewID: string, file: Express.Multer.File, creatorEmail: string) {
    const organization = await this.organizationHelperService.findOrgByID(orgID);
    const payrollPreview = await this.payrollPreviewPrismaHelper.findPayrollPreviewById(orgID, payrollPreviewID);
    const csvData = await this.cloudinaryService.readCSVFile(file);
    const employeeObj = await this.utilService.returnPayrollObjects(csvData);
    const payrollData = await this.utilService.parsePayrollData(employeeObj);
    return await this.payrollPreviewPrismaHelper.bulkUpdateEmployeePayrollInformation(payrollData, organization);
  }


}
