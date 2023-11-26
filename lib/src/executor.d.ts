import { Coins, CreateTxOptions, WaitTxBroadcastResult, Wallet } from '@terra-money/terra.js';
import { Ora } from 'ora';
import { Refs } from './refs.js';
export type ExecutorOptions = {
    network: string;
    signer: Wallet;
    refs: Refs;
};
export type ExecuteContractOptions = {
    sequence?: number;
    coins?: Coins.Input;
    txOptions?: Partial<CreateTxOptions>;
};
export declare class Executor {
    protected network: string;
    protected signer: Wallet;
    protected refs: Refs;
    constructor(options: ExecutorOptions);
    query(contract: string, msg: Object): Promise<unknown>;
    execute(contract: string, msg: Object, options?: ExecuteContractOptions, spinner?: Ora | null): Promise<WaitTxBroadcastResult>;
}
