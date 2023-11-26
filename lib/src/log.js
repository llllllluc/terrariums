import chalk from 'chalk';
export function info(message) {
    console.log(message);
}
export function error(message, options) {
    console.error(chalk.red(message));
    if (options && options.exit) {
        process.exit(options.exit);
    }
    else {
        process.exit(1);
    }
}
export function warn(message) {
    console.warn(chalk.yellow(message));
}
export function waitKey(message) {
    return new Promise((resolve) => {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        info(message);
        process.stdin.once('data', (data) => {
            process.stdin.pause();
            resolve(data.toString().trim());
        });
    });
}
//# sourceMappingURL=log.js.map