import { Coins, Wallet } from "@terra-money/terra.js";
import { Ora } from "ora";
import { Config } from "./config.js";
import { Refs } from "./refs.js";
export type DeployerOptions = {
    network: string;
    config: Config;
    signer: Wallet;
    refs: Refs;
};
export type InstantiateContractOptions = {
    sequence?: number;
    admin?: string;
    coins?: Coins.Input;
    label?: string;
};
export declare class Deployer {
    protected network: string;
    protected config: Config;
    protected signer: Wallet;
    protected refs: Refs;
    constructor(options: DeployerOptions);
    buildContract(contract: string, log?: boolean): void;
    optimizeContract(contract: string, log?: boolean): void;
    storeCode(contract: string, migrateCodeId?: number, spinner?: Ora | null): Promise<string>;
    instantiate(contract: string, msg: Object, options?: InstantiateContractOptions, spinner?: Ora | null): Promise<{
        address: string;
        raw_log: string;
    }>;
}
