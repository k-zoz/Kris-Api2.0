import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "@auth/auth.module";
import { PrismaModule } from "@prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import moment from "moment";
import { APP_FILTER } from "@nestjs/core";
import { AppExceptionFilter } from "@core/filter/app-exception.filter";
import { CurrentUserMiddleware } from "@core/middleware/current-user.middleware";
import { JwtService } from "@nestjs/jwt";
import { utilities as nestWinstonModuleUtilities, WinstonModule } from "nest-winston";
import * as winston from "winston";
import configuration from "@config/configuration";
import { BackOfficeModule } from "@back-office/back-office.module";


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

    BackOfficeModule, AuthModule, PrismaModule],
  controllers: [AppController],
  providers: [

    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: AppInterceptor
    // },
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
      .exclude({ path: "employee/login", method: RequestMethod.POST })
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
