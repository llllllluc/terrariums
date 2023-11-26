import { Key, LCDClient, Wallet } from '@terra-money/terra.js';
import { Config } from './config.js';
export type SignerOptions = {
    lcd: LCDClient;
    network?: string;
    name?: string;
    config?: Config;
    key?: Key;
};
/**
 * Utility class to load mnemonic keys from various sources.
 */
export declare class Signer extends Wallet {
    constructor(options: SignerOptions);
    private static loadKey;
}
