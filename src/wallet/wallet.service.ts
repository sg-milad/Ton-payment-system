import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { KeyPair, keyPairFromSeed } from "@ton/crypto";
import { WalletContractV1R3, WalletContractV3R1, WalletContractV3R2, WalletContractV5R1 } from "@ton/ton";
import { initWasm, WalletCore } from "@trustwallet/wallet-core";
import { PrivateKey } from "@trustwallet/wallet-core/dist/src/wallet-core";

@Injectable()
export class WalletService implements OnModuleInit {
    private walletCore: WalletCore;

    constructor(private configService: ConfigService) { }
    async onModuleInit() {
        this.walletCore = await initWasm();
        if (!this.walletCore) {
            throw Error("Failed to initialize WalletCore");
        }
    }

    async createWallet(account: number, change: number = 0, index: number = 0): Promise<KeyPair> {
        if (!this.walletCore) {
            await this.onModuleInit();
        }
        const { HDWallet, CoinType } = this.walletCore;
        const mnemonic = this.configService.get("wallet.mnemonic");
        const passphrase = this.configService.get("wallet.passphrase");

        const wallet = HDWallet.createWithMnemonic(mnemonic, passphrase);
        const privateKey = wallet.getDerivedKey(CoinType.ton, account, change, index);
        return this.seedToKeyPair(privateKey);
    }

    seedToKeyPair(privateKey: PrivateKey): KeyPair {
        return keyPairFromSeed(Buffer.from(privateKey.data()));
    }

    keyPairToPublicKey(wallet: KeyPair): string {
        const publicKey = WalletContractV3R1.create({ publicKey: wallet.publicKey, workchain: 0 })
        return publicKey.address.toString({ urlSafe: true, bounceable: false })
    }

    privatekeyToPublicKey(privateKey: PrivateKey): string {
        const keyPair = this.seedToKeyPair(privateKey);
        return this.keyPairToPublicKey(keyPair);
    }
    createContractWallet(keyPair: KeyPair) {
        return WalletContractV3R1.create({ publicKey: keyPair.publicKey, workchain: 0 });
    }
}
