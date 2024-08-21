import { productionEnv } from "src/shared/helper/helper";
import { ConfigModuleOptions } from "@nestjs/config";
import walletConfig from "./wallet.config";
import redisConfig from "./redis.config";
import appConfig from "./app.config";

export function ConfigModuleOptions(): ConfigModuleOptions {
    const options: ConfigModuleOptions = {};
    options.isGlobal = true;
    options.cache = true;
    options.load = [walletConfig, redisConfig, appConfig];
    if (!productionEnv()) {
        options.envFilePath = `.env.${process.env.NODE_ENV}`;
    }
    return options;
}
