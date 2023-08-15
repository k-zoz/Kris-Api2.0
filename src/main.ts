import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { json, urlencoded } from "express";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";


const port = process.env.PORT || 4041;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });


  app.use(helmet());
  app.enableCors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Device-Token"],
    exposedHeaders: ["Authorization", "Device-Token"],
    credentials: true
  });

  // app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.set("trust proxy", 1);
  app.use(json({ limit: "100mb" }));
  app.use(urlencoded({ limit: "100mb", extended: true, parameterLimit: 100000000 }));
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe());


  const config = new DocumentBuilder()
    .setTitle("KRIS API")
    .setDescription("The KRIS Resources API")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/doc", app, document);

  await app.listen(port, "0.0.0.0", () => console.log(`Listening on =====>>>>>>> ${port}`));
}

bootstrap();
