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

export function nanofonsToTon(nanofons: number): string {
    return (nanofons / 1e9).toFixed(9);
}
