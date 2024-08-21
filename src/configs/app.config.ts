import { registerAs } from "@nestjs/config";
import * as process from "process";

export default registerAs("app", () => ({
    isMainnet: process.env.IS_MAINNET,
}));
