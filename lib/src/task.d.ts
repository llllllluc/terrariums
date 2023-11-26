import { Deployer } from './deployer.js';
import { Executor } from './executor.js';
import { Signer } from './signers.js';
import { Refs } from './refs.js';
export type Env = {
    deployer: Deployer;
    executor: Executor;
    signer: Signer;
    refs: Refs;
    network: string;
};
export declare function setupEnv(argv: any): Promise<Env>;
export default function task(fn: (env: Env) => Promise<any> | any, exit?: boolean): Promise<any>;
