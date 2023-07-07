import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "@auth/auth.module";
import { PrismaModule } from "@prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import moment from "moment";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { AppExceptionFilter } from "@core/filter/app-exception.filter";
import { CurrentUserMiddleware } from "@core/middleware/current-user.middleware";
import { JwtService } from "@nestjs/jwt";
import { AppInterceptor } from "@core/interceptor/app.interceptor";


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    //
    // WinstonModule.forRoot({
    //   transports: [
    //     new winston.transports.Console({
    //       format: winston.format.combine(
    //         winston.format.timestamp(),
    //         nestWinstonModuleUtilities.format.nestLike()
    //       )
    //     })
    //   ]
    // }),

    AuthModule, PrismaModule],
  controllers: [AppController],
  providers: [

    {
      provide: APP_INTERCEPTOR,
      useClass: AppInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter
    },
    {
      provide: "MomentWrapper",
      useValue: moment
    },
    AppService, CurrentUserMiddleware, JwtService]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware)
      .exclude({ path: "auth/login", method: RequestMethod.POST })
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
