import { MsgTemplate } from "@core/model/msg-template";

export class NewBackOfficerEvent {
  email: string;
  password: string;
  firstname?:string
  lastname?:string
  template?:MsgTemplate
}
