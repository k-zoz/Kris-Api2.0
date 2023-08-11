import {MsgTemplate} from "@core/model/msg-template";

export class MailEvent {
  content: string
  template: MsgTemplate
  recipient: string
  isHtml: boolean
  isAsync: boolean
  subject: string
  context: any

  static data({content = null, context = null, isAsync = false, isHtml = true, recipient, subject = null, template}: {
    content?: string,
    template?: MsgTemplate,
    recipient: string,
    isHtml?: boolean,
    isAsync?: boolean,
    subject: string,
    context?: any
  }): MailEvent {
    const msgEvt = new MailEvent()
    msgEvt.content = content
    msgEvt.context = context
    msgEvt.isAsync = isAsync
    msgEvt.isHtml = isHtml
    msgEvt.recipient = recipient
    msgEvt.subject = subject
    msgEvt.template = template
    return msgEvt;
  }
}
