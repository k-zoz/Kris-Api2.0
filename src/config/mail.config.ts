import {ConfigService} from "@nestjs/config";

export default (config: ConfigService) => {
  return ({
    transport: {
      host: config.get('mail.host'),
      port:587,
      // secure: true,
      auth: {
        user: config.get('mail.user'),
        pass: config.get('mail.password'),
      },
    },
    defaults: {
      from: '"noreply" <noreply@kris.io>'
    },
  })
}
