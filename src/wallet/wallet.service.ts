import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Address } from "@ton/core";
import { initWasm, WalletCore } from "@trustwallet/wallet-core";
import { PrivateKey } from "@trustwallet/wallet-core/dist/src/wallet-core";
@Injectable()
export class WalletService implements OnModuleInit {

    private walletCore: WalletCore;

    constructor(private configService: ConfigService) { }
    async onModuleInit() {
        this.walletCore = await initWasm();
        if (!this.walletCore) {
            throw new Error('Failed to initialize WalletCore');
        }
    }

    async createWallet(account: number, change: number = 0, index: number = 0): Promise<{
        privateKey: PrivateKey;
        publicKey: Address;
    }> {
        if (!this.walletCore) {
            await this.onModuleInit();
        }
        const { HDWallet, CoinType, AnyAddress } = this.walletCore;
        const mnemonic = this.configService.get("wallet.mnemonic")
        const passphrase = this.configService.get("wallet.passphrase")

        const wallet = HDWallet.createWithMnemonic(mnemonic, passphrase);

        const privateKey = wallet.getDerivedKey(CoinType.ton, account, change, index);
        const publicKey = privateKey.getPublicKey(CoinType.ton);

        const rawAddress = AnyAddress.createWithPublicKey(publicKey, CoinType.ton);
        Address.parseFriendly(rawAddress.description()).address.toString()
        return {
            privateKey: privateKey,
            publicKey: Address.parseFriendly(rawAddress.description()).address
        }
    }

    convertPrivateKeyToHexadecimal(privateKey: Uint8Array) {
        const { HexCoding } = this.walletCore;
        return HexCoding.encode(privateKey).substring(2)
    }
}