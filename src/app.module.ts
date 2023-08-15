import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "@auth/auth.module";
import { PrismaModule } from "@prisma/prisma.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import moment from "moment";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { AppExceptionFilter } from "@core/filter/app-exception.filter";
import { CurrentUserMiddleware } from "@core/middleware/current-user.middleware";
import { JwtService } from "@nestjs/jwt";
import { utilities as nestWinstonModuleUtilities, WinstonModule } from "nest-winston";
import * as winston from "winston";
import configuration from "@config/configuration";
import { BackOfficeModule } from "@back-office/back-office.module";
import { EmployeeOrganizationModule } from "@organization/employeeOrganization.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AlertModule } from "./alert/alert.module";
import { MailerModule } from "@nestjs-modules/mailer";
import mailConfig from "@config/mail.config";
import { join } from "path";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),

    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike()
          )
        })
      ]
    }),

    // CacheModule.registerAsync<RedisClientOptions>({
    //   imports:[ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService:ConfigService)=>({
    //     store:redisStore,
    //     ttl: 5,
    //     host: 'localhost',
    //     port: 6379,
    //   })
    // }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get("rateLimitThrottleTtl"),
        limit: config.get("rateLimitThrottleLimit")
      })
    }),
    EventEmitterModule.forRoot(),
    BackOfficeModule, AuthModule, PrismaModule, EmployeeOrganizationModule, AlertModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
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
      .exclude(
        { path: "auth/login", method: RequestMethod.POST },
        { path: "employee/login", method: RequestMethod.POST }
      )
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}

