import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { OnEvent } from "@nestjs/event-emitter";
import { KrisEventConst } from "@core/event/kris-event.const";
import {
  NewBackOfficerEvent,
  NewEmployeeEvent, NewEmployeePasswordResetEvent,
  NewOrganizationEvent,
  PasswordChangeEvent
} from "@core/event/back-office-event";
import { MailerService } from "@nestjs-modules/mailer";
import { template } from "handlebars";
import { AppException } from "@core/exception/app-exception";
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

  async sendResetPasswordDetailsMail(event: NewBackOfficerEvent| NewEmployeePasswordResetEvent) {
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

  async sendWelcomeEmployeeDetailMail(event:NewEmployeeEvent){
    const relativePath = "../../templates/welcomeEmployee.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      firstname: event.firstname,
      email:event.email,
      password: event.password,
      organizationName: event.organizationName
    };
    return template(data)
  }

  async sendPasswordChangeSuccessfulEmail(event:PasswordChangeEvent) {
    const relativePath = "../../templates/passwordChangeSuccessful.hbs";
    const absolutePath = path.join(__dirname, relativePath);
    const sourceFile = fs.readFileSync(absolutePath, "utf-8");
    const template = Handlebars.compile(sourceFile);
    const data = {
      firstname: event.firstName
    }
    return template(data)
  }


}
