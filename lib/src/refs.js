import * as fs from 'fs';
import { warn } from './log.js';
export class Refs {
    refs;
    config;
    constructor(refInfo, config) {
        this.refs = refInfo;
        this.config = config;
    }
    getContract(network, contract) {
        if (!this.refs[network]) {
            throw new Error(`Network ${network} not found in refs`);
        }
        if (!this.refs[network][contract]) {
            throw new Error(`Contract ${contract} not found for network ${network}`);
        }
        return this.refs[network][contract];
    }
    getCodeId(network, contract) {
        if (!this.refs[network]) {
            throw new Error(`Network ${network} not found in refs`);
        }
        if (!this.refs[network][contract]) {
            throw new Error(`Contract ${contract} not found for network ${network}`);
        }
        return this.getContract(network, contract).codeId;
    }
    setCodeId(network, contract, codeId) {
        if (!this.refs[network]) {
            this.refs[network] = {};
        }
        if (!this.refs[network][contract]) {
            this.refs[network][contract] = {};
        }
        this.refs[network][contract].codeId = codeId;
    }
    getAddress(network, contract) {
        if (!this.refs[network]) {
            throw new Error(`Network ${network} not found in refs`);
        }
        if (!this.refs[network][contract]) {
            throw new Error(`Contract ${contract} not found for network ${network}`);
        }
        return this.getContract(network, contract).address;
    }
    setAddress(network, contract, address) {
        if (!this.refs[network]) {
            this.refs[network] = {};
        }
        if (!this.refs[network][contract]) {
            this.refs[network][contract] = {};
        }
        this.refs[network][contract].address = address;
    }
    saveRefs() {
        if (!this.config) {
            throw new Error('No configuration data provided, use saveRefsTo() instead');
        }
        fs.writeFileSync(this.config.refs.base_path, JSON.stringify(this.refs, null, 2));
        (this.config.refs.copy_refs_to || []).forEach((dest) => {
            fs.copyFileSync(this.config.refs.base_path, dest);
        });
    }
    saveRefsTo(path, copyTo) {
        fs.writeFileSync(path, JSON.stringify(this.refs, null, 2));
        (copyTo || []).forEach((dest) => {
            fs.copyFileSync(path, dest);
        });
    }
}
export function loadRefsFromFile(basePath) {
    if (!fs.existsSync(basePath)) {
        warn(`Refs file not found at ${basePath}, creating new one`);
        fs.writeFileSync(basePath, JSON.stringify({}, null, 2));
        return new Refs({});
    }
    const refs = JSON.parse(fs.readFileSync(basePath, 'utf8'));
    return new Refs(refs);
}
export function loadRefs(config) {
    const refs = loadRefsFromFile(config.refs.base_path);
    return new Refs(refs.refs, config);
}
//# sourceMappingURL=refs.js.map