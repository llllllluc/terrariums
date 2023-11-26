import { MsgInstantiateContract, MsgMigrateCode, MsgStoreCode, } from "@terra-money/terra.js";
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import ora from "ora";
import { platform } from "os";
import path from "path";
import { parse as parseTOML } from "toml";
import { waitForInclusionInBlock } from "./utils.js";
const OPTIMIZER_VERSION = "0.15.0";
export class Deployer {
    network;
    config;
    signer;
    refs;
    constructor(options) {
        this.network = options.network;
        this.config = options.config;
        this.signer = options.signer;
        this.refs = options.refs;
    }
    buildContract(contract, log = true) {
        if (!this.config.contracts[contract]) {
            throw new Error(`Contract ${contract} build information not found in config file.`);
        }
        const buildInfo = this.config.contracts[contract];
        const contractFolder = path.join(process.cwd(), buildInfo.src);
        const cwd = process.cwd();
        process.chdir(contractFolder);
        execSync("cargo wasm", { stdio: log ? "inherit" : "ignore" });
        process.chdir(cwd);
    }
    optimizeContract(contract, log = true) {
        const arm64 = process.arch === "arm64" && process.env.TERRARIUMS_ARCH_ARM64;
        if (this.config.workspace_optimizer) {
            const image = `cosmwasm/workspace-optimizer${arm64 ? "-arm64" : ""}:${OPTIMIZER_VERSION}`;
            const dir = platform() === "win32" ? "%cd%" : "$(pwd)";
            execSync(`docker run --rm -v "${dir}":/code \
              --mount type=volume,source="${path.basename(process.cwd())}_cache",target=/code/target \
              --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
              ${image}`, { stdio: log ? "inherit" : "ignore" });
            return;
        }
        if (!this.config.contracts[contract]) {
            throw new Error(`Contract ${contract} build information not found in config file.`);
        }
        const buildInfo = this.config.contracts[contract];
        const contractFolder = path.join(process.cwd(), buildInfo.src);
        const cwd = process.cwd();
        process.chdir(contractFolder);
        const cargoFile = path.join(contractFolder, "Cargo.toml");
        if (!existsSync(cargoFile)) {
            throw new Error(`Cargo.toml not found in ${contractFolder}`);
        }
        const { package: pkg } = parseTOML(readFileSync(cargoFile, "utf8"));
        if (pkg.metadata?.scripts?.optimize) {
            const { optimize } = pkg.metadata.scripts;
            // TODO: is this really a good idea?
            /* eslint-disable no-eval */
            const optimizeCmd = eval(`\`${optimize}\``);
            execSync(optimizeCmd, { stdio: log ? "inherit" : "ignore" });
        }
        else {
            const image = `cosmwasm/rust-optimizer${arm64 ? "-arm64" : ""}:${OPTIMIZER_VERSION}`;
            const dir = platform() === "win32" ? "%cd%" : "$(pwd)";
            execSync(`docker run --rm -v "${dir}":/code \
              --mount type=volume,source="${contract}_cache",target=/code/target \
              --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
              ${image}`, { stdio: log ? "inherit" : "ignore" });
        }
        process.chdir(cwd);
    }
    async storeCode(contract, migrateCodeId, spinner = ora({ spinner: "dots" })) {
        if (!this.config.contracts[contract]) {
            throw new Error(`Contract ${contract} build information not found in config file.`);
        }
        const buildInfo = this.config.contracts[contract];
        const contractFolder = this.config.workspace_optimizer
            ? process.cwd()
            : path.join(process.cwd(), buildInfo.src);
        const cwd = process.cwd();
        process.chdir(contractFolder);
        const arm64 = process.arch === "arm64";
        let wasmByteCodeFilename = `${contract.replace(/-/g, "_")}`;
        if (arm64 && process.env.TERRARIUMS_ARCH_ARM64) {
            wasmByteCodeFilename += "-aarch64";
        }
        wasmByteCodeFilename += ".wasm";
        const wasm = path.join(contractFolder, "artifacts", wasmByteCodeFilename);
        if (!existsSync(wasm)) {
            throw new Error(`WASM file "${wasm}" not found in artifacts folder`);
        }
        const wasmByteCode = readFileSync(wasm).toString("base64");
        spinner?.start(`Uploading bytecode for ${contract}...`);
        const storeCodeTx = await this.signer.createAndSignTx({
            msgs: [
                migrateCodeId
                    ? new MsgMigrateCode(this.signer.key.accAddress, migrateCodeId, wasmByteCode)
                    : new MsgStoreCode(this.signer.key.accAddress, wasmByteCode),
            ],
        });
        const result = await this.signer.lcd.tx.broadcastSync(storeCodeTx);
        if ("code" in result) {
            spinner?.fail();
            throw new Error(`Error storing wasm file for ${contract}:\n${result.raw_log}`);
        }
        const res = await waitForInclusionInBlock(this.signer.lcd, result.txhash);
        spinner?.succeed();
        try {
            const savedCodeId = JSON.parse((res && res.raw_log) || "")[0]
                .events.find((msg) => msg.type === "store_code")
                .attributes.find((attr) => attr.key === "code_id").value;
            process.chdir(cwd);
            spinner.succeed(`Uploaded bytecode for ${contract}, code id: ${savedCodeId}`);
            this.refs.setCodeId(this.network, contract, savedCodeId);
            this.refs.saveRefsTo(this.config.refs.base_path, this.config.refs.copy_refs_to);
            return savedCodeId;
        }
        catch (e) {
            spinner.fail(`Uploaded bytecode for ${contract}, unexpected error parsing results:`);
            if (e instanceof SyntaxError) {
                throw new Error(`Error parsing raw_log from store_code transaction: ${e.message}`);
            }
            else {
                throw new Error(`Unexpcted Error: ${e}`);
            }
        }
    }
    async instantiate(contract, msg, options, spinner = ora({ spinner: "dots" })) {
        const codeId = this.refs.getCodeId(this.network, contract);
        if (!codeId) {
            throw new Error(`Contract ${contract} code id not found in refs.`);
        }
        spinner?.start(`Instantiating ${contract} with code id ${codeId}...`);
        // Allow manual account sequences.
        const manualSequence = options?.sequence || (await this.signer.sequence());
        const txOptions = {
            msgs: [
                new MsgInstantiateContract(this.signer.key.accAddress, options?.admin, parseInt(codeId, 10), msg, options?.coins, options?.label || "Instantiate"),
            ],
        };
        // Set default terraDenom and feeDenoms value if not specified.
        if (!txOptions.feeDenoms) {
            txOptions.feeDenoms = ["uluna"];
        }
        const instantiateTx = await this.signer.createAndSignTx({
            sequence: manualSequence,
            ...txOptions,
        });
        const result = await this.signer.lcd.tx.broadcastSync(instantiateTx);
        const res = await waitForInclusionInBlock(this.signer.lcd, result.txhash);
        let log = [];
        try {
            log = JSON.parse(res.raw_log);
        }
        catch (e) {
            spinner?.fail();
            if (e instanceof SyntaxError && res) {
                throw new Error(`Error instantiating ${contract}:\n${res.raw_log}`);
            }
            else {
                throw new Error(`Unexpcted Error: ${e}`);
            }
        }
        spinner?.succeed();
        const event = log[0].events.find((event) => event.type === "instantiate_contract") ??
            log[0].events.find((event) => event.type === "instantiate");
        const contractAddress = event.attributes.find((attr) => attr.key === "_contract_address").value;
        spinner?.succeed(`Instantiated ${contract} with address ${contractAddress}`);
        this.refs.setAddress(this.network, contract, contractAddress);
        this.refs.saveRefsTo(this.config.refs.base_path, this.config.refs.copy_refs_to);
        return { address: contractAddress, raw_log: res.raw_log };
    }
}
//# sourceMappingURL=deployer.js.map