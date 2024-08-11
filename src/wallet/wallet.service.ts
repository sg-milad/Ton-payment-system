import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { initWasm, WalletCore } from "@trustwallet/wallet-core";
import { PrivateKey } from "@trustwallet/wallet-core/dist/src/wallet-core";

@Injectable()
export class WalletService implements OnModuleInit {

    private walletCore: WalletCore;

    constructor(private configService: ConfigService) { }
    async onModuleInit() {
        this.walletCore = await initWasm();
    }

    async createWallet(account: number, change: number, index: number): Promise<PrivateKey> {
        if (!this.walletCore) {
            await this.onModuleInit();
        }
        const { HDWallet, CoinType } = this.walletCore;
        const mnemonic = this.configService.get("wallet.mnemonic")
        const passphrase = this.configService.get("wallet.passphrase")

        const wallet = HDWallet.createWithMnemonic(mnemonic, passphrase);
        return wallet.getDerivedKey(CoinType.ton, account, change, index);
    }
    async getAddress(account: number, change: number, index: number) {
        if (!this.walletCore) {
            await this.onModuleInit();
        }
        const { AnyAddress, CoinType } = this.walletCore;

        const privateKey = await this.createWallet(account, change, index);
        const publicKey = privateKey.getPublicKey(CoinType.ton);

        const rawAddress = AnyAddress.createWithPublicKey(publicKey, CoinType.ton);
        return rawAddress.description();
    }

    convertPrivateKeyToHexadecimal(privateKey: Uint8Array) {
        const { HexCoding } = this.walletCore;
        return HexCoding.encode(privateKey).substring(2)
    }
}