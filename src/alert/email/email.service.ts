import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { OnEvent } from "@nestjs/event-emitter";
import { KrisEventConst } from "@core/event/kris-event.const";
import { NewBackOfficerEvent } from "@core/event/back-office-event";
import { MailerService } from "@nestjs-modules/mailer";
import { template } from "handlebars";
import { AppException } from "@core/exception/app-exception";

const resend = new Resend("re_3cZyUYZS_KKmL5sSQ8ws8nmWT8HRRcm6A");


@Injectable()
export class EmailService {

  private readonly logger = new Logger(EmailService.name);


  constructor(private readonly configService: ConfigService,
              private readonly mailerService: MailerService
  ) {
  }

  private mailSource = this.configService.get("mailSender");


  @OnEvent(KrisEventConst.createEvents.boUser)
  // async sendLoginDetailsMail(event: NewBackOfficerEvent) {
  //   try {
  //     await this.mailerService.sendMail({
  //       from: this.mailSource,
  //       to: event.email,
  //       subject: `Welcome to KRIS`,
  //       html: `<h1>Welcome to My Company!</h1>
  //   <p>Dear ${event.firstname},</p>
  //   <p>We're excited to have you on board! Thank you for choosing My Company.</p>
  //   <p>As a member, you'll have access to all of our exclusive content and features. We're always adding new things, so be sure to check back often.</p>
  //     <p>Here's your login credentials</p>
  //   <p>Email: <strong>${event.email}</strong></p>
  //   <p>Password: <strong>${event.password}</strong></p>
  //   <p>Please remember to change your password after signing in.</p>`
  //     });
  //     this.logger.log(`Email successfully sent`);
  //     return "Email successfully sent";
  //   } catch (e) {
  //     this.logger.error(e, "Error sending email");
  //     throw new AppException();
  //   }
  // }

  async sendLoginDetailsMail(event: NewBackOfficerEvent) {
    try {
      await this.mailerService.sendMail({
        from: this.mailSource,
        to: event.email,
        subject: `Welcome to KRIS`,
        template: `welcomeBo`,
        context: {
          event:event
        }
      });
      this.logger.log(`Email successfully sent`);
      return "Email successfully sent";
    } catch (e) {
      this.logger.error(e, "Error sending email");
      throw new AppException();
    }
  }


}
