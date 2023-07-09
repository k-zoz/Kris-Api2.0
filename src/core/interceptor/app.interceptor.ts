import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { AuthPayload } from "@core/dto/auth/auth-payload";

@Injectable()
export class AppInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AppInterceptor.name);


  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.logger.log("<<<<<<< Data Intercepted >>>>>>>>>>");
    const body = context.switchToHttp().getRequest().body;
    const method = context.switchToHttp().getRequest().method;
    // const headers = context.switchToHttp().getRequest().headers;
    // console.log(body);
    // console.log(method);
    // console.log(headers);


    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      const currentUser = context.getArgs()[0].user as AuthPayload;

      const payload = body as any;
      const authPayload = new AuthPayload();

      if (!currentUser) {
        payload.authPayload = authPayload;
      } else {
        payload.authPayload = currentUser;
      }
    }
    return next.handle().pipe(
      tap(() => this.logger.log(`After... ${Date.now() - Date.now()}ms`))
    );
  }
}
