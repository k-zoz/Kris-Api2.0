import { MsgTemplate } from "@core/model/msg-template";

export class NewBackOfficerEvent {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  template?: MsgTemplate;
}

export class NewEmployeePasswordResetEvent {
  email: string;
  password: string;
  firstname: string;
}

export class NewOrganizationEvent {
  organizationName: string;
}

export class NewEmployeeEvent {
  firstname: string;
  email: string;
  password: string;
  organizationName?: string;
}


export class PasswordChangeEvent {
  firstName: string;
}


export class PayslipEmailEvent {
  organizationName: string;
  employeeFirstName: string;
  employeeLastName: string;
  payslipStartDate: any;
  payslipEndDate: any;
}


export class LeaveApplicationEvent {
  employeeName:string
  leaveStartDate:any
  leaveEndDate:any
}

export class LeaveApprovalEvent {
  employeeName:string
  leaveStartDate:string
  leaveEndDate:string
}


export class HODConfirmationEvent{
  employeeFirstName:string
  departmentName:string
  organizationName:string
}

export class JobApplicationConfirmationEmail {
  applicant_name:string
  company_name:string
  job_title:string
}

export class TeamLeadConfirmationEvent{
  employeeFirstName:string
  departmentName?:string
  teamName:string
  organizationName:string

}
