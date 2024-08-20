import { registerAs } from "@nestjs/config";
import * as process from "process";

export default registerAs("redis", () => ({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
}));
