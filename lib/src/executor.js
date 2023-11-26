import { MsgExecuteContract, } from '@terra-money/terra.js';
import ora from 'ora';
export class Executor {
    network;
    signer;
    refs;
    constructor(options) {
        this.network = options.network;
        this.signer = options.signer;
        this.refs = options.refs;
    }
    async query(contract, msg) {
        const contractAddress = contract.startsWith('terra1')
            ? contract
            : this.refs.getContract(this.network, contract).address;
        return this.signer.lcd.wasm.contractQuery(contractAddress, msg);
    }
    async execute(contract, msg, options, spinner = ora({ spinner: 'dots' })) {
        const contractAddress = contract.startsWith('terra1')
            ? contract
            : this.refs.getContract(this.network, contract).address;
        const manualSequence = options?.sequence || (await this.signer.sequence());
        const msgs = [
            new MsgExecuteContract(this.signer.key.accAddress, contractAddress, msg, options?.coins),
        ];
        const mergedOptions = options?.txOptions
            ? { ...options.txOptions, msgs, sequence: manualSequence }
            : { msgs, sequence: manualSequence };
        spinner?.start(`Executing contract with message: ${JSON.stringify(msg)}`);
        const tx = await this.signer.createAndSignTx(mergedOptions);
        const logs = await this.signer.lcd.tx.broadcast(tx);
        spinner?.succeed(`Executed contract with message: ${JSON.stringify(msg)}`);
        return logs;
    }
}
//# sourceMappingURL=executor.js.map