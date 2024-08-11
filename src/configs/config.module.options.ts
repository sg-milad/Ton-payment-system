import { productionEnv } from "src/shared/helper/helper";
import { ConfigModuleOptions } from "@nestjs/config";
import walletConfig from "./wallet.config";

export function ConfigModuleOptions(): ConfigModuleOptions {
    const options: ConfigModuleOptions = {};
    options.isGlobal = true;
    options.cache = true;
    options.load = [walletConfig];
    if (!productionEnv()) {
        options.envFilePath = `.env.${process.env.NODE_ENV}`;
    }
    return options;
}
