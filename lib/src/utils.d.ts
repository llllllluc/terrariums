/// <reference types="yargs" />
import { LCDClient } from '@terra-money/terra.js';
export declare const LOCALTERRA_MNEMONICS: {
    [name: string]: string;
};
export declare const waitForInclusionInBlock: (lcd: LCDClient, txHash: string) => Promise<any>;
export declare const cliOptions: import("yargs").Argv<{
    config: string;
} & {
    network: string;
} & {
    signer: string;
} & {
    arm64: boolean;
}>;
