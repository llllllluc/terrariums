import { Config } from './config.js';
export interface ContractInfo {
    codeId?: string;
    address?: string;
}
export interface refs {
    [network: string]: {
        [contract: string]: ContractInfo;
    };
}
export declare class Refs {
    refs: refs;
    protected config?: Config;
    constructor(refInfo: refs, config?: Config);
    getContract(network: string, contract: string): ContractInfo;
    getCodeId(network: string, contract: string): string | undefined;
    setCodeId(network: string, contract: string, codeId: string): void;
    getAddress(network: string, contract: string): string | undefined;
    setAddress(network: string, contract: string, address: string): void;
    saveRefs(): void;
    saveRefsTo(path: string, copyTo?: string[]): void;
}
export declare function loadRefsFromFile(basePath: string): Refs;
export declare function loadRefs(config: Config): Refs;
