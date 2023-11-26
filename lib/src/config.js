import * as fs from 'fs';
import { error } from './log.js';
export function loadConfig(configPath) {
    if (!fs.existsSync(configPath)) {
        error(`Config file not found at ${configPath}`, { exit: 1 });
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
}
export function defaultNetworkInfo(network) {
    switch (network) {
        case 'localterra':
            return {
                chainID: 'localterra',
                URL: 'http://localhost:1317',
            };
        case 'testnet':
            return {
                chainID: 'pisco-1',
                URL: 'https://pisco-lcd.terra.dev',
            };
        case 'mainnet':
            return {
                chainID: 'phoenix-1',
                URL: 'https://phoenix-lcd.terra.dev',
            };
        default:
            throw new Error(`Unknown network ${network}`);
    }
}
//# sourceMappingURL=config.js.map