import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WalletService } from './wallet.service';
import { initWasm } from '@trustwallet/wallet-core';
import { Address } from '@ton/core';

describe('WalletService', () => {
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
                            if (key === 'wallet.mnemonic') return 'test test test test test test test test test test test junk';
                            if (key === 'wallet.passphrase') return 'testpassphrase';
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
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createWallet', () => {
        it('should create a wallet and return private and public keys', async () => {
            const wallet = await service.createWallet(0, 0, 0);

            expect(wallet).toHaveProperty('privateKey');
            expect(wallet).toHaveProperty('publicKey');
            expect(wallet.publicKey.toString().length).toBeGreaterThan(0);
        });
        it('should not create same public key', async () => {
            const wallet1 = await service.createWallet(0, 0, 1);
            const wallet2 = await service.createWallet(1, 0, 23);

            expect(wallet1).toHaveProperty('privateKey');
            expect(wallet2).toHaveProperty('privateKey');

            expect(wallet1).toHaveProperty('publicKey');
            expect(wallet2).toHaveProperty('publicKey');

            expect(wallet1.publicKey).not.toEqual(wallet2.publicKey)
        });

    });

    describe('convertPrivateKeyToHexadecimal', () => {
        it('should convert private key to hexadecimal', async () => {
            const wallet = await service.createWallet(0, 0, 0);
            const hexPrivateKey = service.convertPrivateKeyToHexadecimal(wallet.privateKey.data());

            expect(typeof hexPrivateKey).toBe('string');
            expect(hexPrivateKey.length).toBe(64); // 32 bytes * 2 characters per byte
            expect(/^[0-9a-f]+$/.test(hexPrivateKey)).toBe(true); // Should only contain hexadecimal characters
        });
    });
});