import { MsgTemplate } from "@core/model/msg-template";

export class NewBackOfficerEvent {
  email: string;
  password: string;
  firstname?:string
  lastname?:string
  template?:MsgTemplate
}


export class NewOrganizationEvent {
  organizationName:string
}

export class NewEmployeeEvent {
  firstname:string
  email:string
  password:string
  organizationName?:string
}


export class PasswordChangeEvent {
  firstName:string
}
