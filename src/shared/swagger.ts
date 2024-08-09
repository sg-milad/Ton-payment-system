import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { developmentEnv } from "./helper/helper";

const configure = (app: INestApplication) => {
    if (!developmentEnv()) return;
    const swaggerConfig = new DocumentBuilder()
        .setTitle(`exchange rate API's`)
        .setDescription("Web Services")
        .setVersion("1.0.0")
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("/docs", app, document);
};

export default { configure };
