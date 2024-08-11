import { registerAs } from "@nestjs/config";
import * as process from "process";

export default registerAs("wallet", () => ({
    mnemonic: process.env.WALLET_MNEMONIC,
    passphrase: process.env.WALLET_SEED_PASSPHRASE,
    account: process.env.WALLET_ACCOUNT,
    change: process.env.WALLET_CHANGE,
}));
