import * as process from "process";

export function processEnv() {
    return process.env.NODE_ENV;
}

export function developmentEnv() {
    return processEnv() == "dev";
}

export function productionEnv() {
    return processEnv() == "prod";
}
