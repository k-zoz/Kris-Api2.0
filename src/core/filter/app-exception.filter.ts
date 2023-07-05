import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import {
  AppConflictException,
  AppException,
  AppNotFoundException,
  AppUnauthorizedException
} from "@core/exception/app-exception";
import { Request, Response } from "express";
import { isArray } from "class-validator";
import { Utils } from "@core/utils/utils";

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(e: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = e instanceof HttpException ? e.getStatus() :HttpStatus.INTERNAL_SERVER_ERROR


    let msg = e?.message;

    if (e instanceof AppException ||
      e instanceof AppNotFoundException ||
      e instanceof AppConflictException ||
      e instanceof AppUnauthorizedException) {
      if (isArray(e.message)) {
        msg = e.message;
      }
      msg = [e.message];
    } else {
      if (e?.response?.message) {
        if (isArray(e?.response?.message)) {
          msg = <Array<string>>e.response.message;
        } else {
          msg = msg.split(",");
        }
      } else {
        msg = [msg];
      }
    }

    const message = {
      status,
      errorMessage: msg,
      path: request.url,
      timestamp: new Date().toDateString()
    };
    response.status(status).send(message)
  }
}
