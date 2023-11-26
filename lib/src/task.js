import { LCDClient } from '@terra-money/terra.js';
import { loadConfig } from './config.js';
import { cliOptions } from './utils.js';
import { error } from './log.js';
import { Deployer } from './deployer.js';
import { Executor } from './executor.js';
import { Signer } from './signers.js';
import { loadRefs } from './refs.js';
export async function setupEnv(argv) {
    const config = loadConfig(argv.config);
    if (!config.networks[argv.network]) {
        error(`Network ${argv.network} not found in config`, { exit: 1 });
    }
    const network = config.networks[argv.network];
    const lcd = new LCDClient(network);
    const signer = new Signer({
        lcd,
        network: argv.network,
        config,
        name: argv.signer,
    });
    const refs = loadRefs(config);
    const deployer = new Deployer({
        network: argv.network,
        config,
        signer,
        refs,
    });
    const executor = new Executor({
        network: argv.network,
        signer,
        refs,
    });
    return {
        deployer,
        executor,
        signer,
        refs,
        network: argv.network,
    };
}
/* eslint-disable no-unused-vars */
export default async function task(fn, exit = true) {
    const argv = await cliOptions.argv;
    if (argv.arm64) {
        process.env.TERRARIUM_ARCH_ARM64 = '1';
    }
    const env = await setupEnv(await cliOptions.argv);
    return fn(env)
        .then((result) => {
        if (exit) {
            process.exit(0);
        }
        return result;
    })
        .catch((err) => {
        error(err.message, { exit: 1 });
    });
}
//# sourceMappingURL=task.js.map