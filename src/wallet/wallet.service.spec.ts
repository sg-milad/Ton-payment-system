import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { WalletService } from "./wallet.service";
import { initWasm } from "@trustwallet/wallet-core";
import TonWeb from "tonweb";
describe("WalletService", () => {
    let service: WalletService;
    let configService: ConfigService;

    beforeAll(async () => {
        await initWasm();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WalletService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: (key: string) => {
                            if (key === "wallet.mnemonic")
                                return "test test test test test test test test test test test junk";
                            if (key === "wallet.passphrase") return "testpassphrase";
                            return null;
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<WalletService>(WalletService);
        configService = module.get<ConfigService>(ConfigService);

        await service.onModuleInit();
    }, 30000);
    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createWallet", () => {
        it("should create a valid private key", async () => {
            const wallet = await service.createWallet(0, 0, 0);
            const publicKey = await service.keyPairToPublicKey(wallet);
            expect(wallet).toHaveProperty("publicKey");
            expect(wallet).toHaveProperty("secretKey");
            expect(TonWeb.utils.Address.isValid(publicKey)).toBe(true);
        });
        it("should not create two different public key", async () => {
            const wallet1 = await service.createWallet(0, 0, 1);
            const wallet2 = await service.createWallet(1, 0, 23);
            const publicKey1 = await service.keyPairToPublicKey(wallet1);
            const publicKey2 = await service.keyPairToPublicKey(wallet2);
            expect(TonWeb.utils.Address.isValid(publicKey1)).toBe(true);
            expect(TonWeb.utils.Address.isValid(publicKey1)).toBe(true);
            expect(publicKey1).not.toEqual(publicKey2);
        });
    });
});
