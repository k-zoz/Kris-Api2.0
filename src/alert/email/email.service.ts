import { Injectable, Logger } from "@nestjs/common";
import {
  ErrorAutoResponse,
  ErrorEmail,
  HODConfirmationEvent, JobApplicationConfirmationEmail,
  LeaveApplicationEvent, LeaveApprovalEvent,
  NewBackOfficerEvent,
  NewEmployeeEvent, NewEmployeePasswordResetEvent,
  NewOrganizationEvent,
  PasswordChangeEvent, PayslipEmailEvent, TeamLeadConfirmationEvent
} from "@core/event/back-office-event";
import * as path from "path";

const Handlebars = require("handlebars");
const fs = require("fs");


@Injectable()
export class EmailService {

  private readonly logger = new Logger(EmailService.name);

  constructor() {
  }


  // @OnEvent(KrisEventConst.createEvents.boUser)
  async sendLoginDetailsMail(event: NewBackOfficerEvent) {
    const relativePath = "../../templates/welcomeBo.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      firstname: event.firstname,
      email: event.email,
      password: event.password
    };
    return template(data);
  }

  async sendResetPasswordDetailsMail(event: NewBackOfficerEvent | NewEmployeePasswordResetEvent) {
    const relativePath = "../../templates/resetPassword.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      firstname: event.firstname,
      password: event.password
    };
    return template(data);
  }

  async sendWelcomeOrganizationDetailsMail(event: NewOrganizationEvent) {
    const relativePath = "../../templates/welcomeOrg.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      organizationName: event.organizationName
    };
    return template(data);
  }

  async sendWelcomeEmployeeDetailMail(event: NewEmployeeEvent) {
    const relativePath = "../../templates/welcomeEmployee.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      firstname: event.firstname,
      email: event.email,
      password: event.password,
      organizationName: event.organizationName
    };
    return template(data);
  }

  async sendPasswordChangeSuccessfulEmail(event: PasswordChangeEvent) {
    const relativePath = "../../templates/passwordChangeSuccessful.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      firstname: event.firstName
    };
    return template(data);
  }

  async sendPayrollEmail(event: PayslipEmailEvent) {
    const relativePath = "../../templates/paySlipEmail.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      organizationName: event.organizationName,
      employeeFirstName: event.employeeFirstName,
      employeeLastName: event.employeeLastName,
      payslipStartDate: event.payslipStartDate,
      payslipEndDate: event.payslipEndDate
    };
    return template(data);
  }


  async sendLeaveApprovalEmail(event: LeaveApprovalEvent) {
    const relativePath = "../../templates/leaveApproval.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      firstname: event.employeeName,
      leaveStartDate: event.leaveStartDate,
      leaveEndDate: event.leaveEndDate
    };
    return template(data);
  }

  async sendLeaveApplicationEmail(event: LeaveApplicationEvent) {
    const relativePath = "../../templates/leaveApproval.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      firstname: event.employeeName,
      leaveStartDate: event.leaveStartDate,
      leaveEndDate: event.leaveEndDate
    };
    return template(data);
  }

  async sendLeaveRejectionEmail(event: LeaveApplicationEvent) {
    const relativePath = "../../templates/leaveApproval.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      firstname: event.employeeName,
      leaveStartDate: event.leaveStartDate,
      leaveEndDate: event.leaveEndDate
    };
    return template(data);
  }

  async sendHODConfirmationEmail(event: HODConfirmationEvent) {
    const relativePath = "../../templates/hodConfirmation.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      employeeFirstName: event.employeeFirstName,
      departmentName: event.departmentName,
      organizationName: event.organizationName
    };
    return template(data);
  }

  async jobApplicationConfirmationEmail(event: JobApplicationConfirmationEmail) {
    const relativePath = "../../templates/jobApplication.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      company_name: event.company_name,
      applicant_name: event.applicant_name,
      job_title: event.job_title
    };
    return template(data);
  }

  async errorToKrisTeam(event: ErrorEmail) {
    const relativePath = "../../templates/contactSupport.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      name: event.name,
      employeeName: event.employeeName,
      description: event.description
    };
    return template(data);
  }

  async sendAutoResponseToEmployee(event: ErrorAutoResponse) {
    const relativePath = "../../templates/supportAutoResponse.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      customerFirstName: event.customerFirstName
    };
    return template(data);
  }


  async sendTeamLeadConfirmationEmail(event: TeamLeadConfirmationEvent) {
    const relativePath = "../../templates/teamLeadConfirmation.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      employeeFirstName: event.employeeFirstName,
      teamName: event.teamName,
      organizationName: event.organizationName
    };
    return template(data);
  }


}
