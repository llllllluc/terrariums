export interface NetworkInfo {
    chainID: string;
    URL: string;
}
export interface SignerInfo {
    mnemonic: string;
    network?: string;
}
export interface Config {
    networks: {
        [network: string]: NetworkInfo;
    };
    refs: {
        base_path: string;
        copy_refs_to?: string[];
    };
    signers?: {
        [signer: string]: SignerInfo;
    };
    contracts: {
        [contract: string]: {
            src: string;
            deploy_script?: string;
            instantiate_msg?: string;
        };
    };
    workspace_optimizer?: boolean;
}
export declare function loadConfig(configPath: string): Config;
export declare function defaultNetworkInfo(network: string): NetworkInfo;
