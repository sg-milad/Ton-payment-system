import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { KeyPair, keyPairFromSeed } from "@ton/crypto";
import { initWasm, WalletCore } from "@trustwallet/wallet-core";
import { PrivateKey } from "@trustwallet/wallet-core/dist/src/wallet-core";
import TonWeb from "tonweb";
@Injectable()
export class WalletService implements OnModuleInit {

    private walletCore: WalletCore;
    private tonWeb: TonWeb

    constructor(private configService: ConfigService) { }
    async onModuleInit() {
        const endpoint = await getHttpEndpoint({ network: "mainnet" })
        this.tonWeb = new TonWeb(new TonWeb.HttpProvider(endpoint));
        this.walletCore = await initWasm();
        if (!this.walletCore) {
            throw new Error('Failed to initialize WalletCore');
        }
    }

    async createWallet(account: number, change: number = 0, index: number = 0): Promise<KeyPair> {
        if (!this.walletCore) {
            await this.onModuleInit();
        }
        const { HDWallet, CoinType } = this.walletCore;
        const mnemonic = this.configService.get("wallet.mnemonic")
        const passphrase = this.configService.get("wallet.passphrase")

        const wallet = HDWallet.createWithMnemonic(mnemonic, passphrase);
        const privateKey = wallet.getDerivedKey(CoinType.ton, account, change, index);
        return this.seedToKeyPair(privateKey)
    }

    seedToKeyPair(privateKey: PrivateKey): KeyPair {
        return keyPairFromSeed(Buffer.from(privateKey.data()))
    }

    async keyPairToPublicKey(keyPair: KeyPair): Promise<string> {
        const wallet = await this.tonWeb.wallet.create({ publicKey: keyPair.publicKey }).getAddress()
        return wallet.toString(true, true, false)
    }

    async privatekeyToPublicKey(privateKey: PrivateKey): Promise<string> {
        const keyPair = this.seedToKeyPair(privateKey)
        return await this.keyPairToPublicKey(keyPair)
    }
}