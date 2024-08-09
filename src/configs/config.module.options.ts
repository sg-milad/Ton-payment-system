import { productionEnv } from "src/shared/helper/helper";
import databaseConfig from "./database.config";
import { ConfigModuleOptions } from "@nestjs/config";

export function ConfigModuleOptions(): ConfigModuleOptions {
    const options: ConfigModuleOptions = {};
    options.isGlobal = true;
    options.cache = true;
    options.load = [databaseConfig];
    if (!productionEnv()) {
        options.envFilePath = `.env.${process.env.NODE_ENV}`;
    }
    return options;
}
