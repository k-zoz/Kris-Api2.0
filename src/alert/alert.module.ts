import { Global, Module } from "@nestjs/common";
import { EmailService } from "./email/email.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import mailConfig from "@config/mail.config";
import { join } from "path";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";

@Global()
@Module({
  imports: [

  ],
  controllers: [],
  providers: [EmailService, ConfigService],
  exports: [EmailService]
})
export class AlertModule {
}
