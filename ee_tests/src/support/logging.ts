import * as chalk from 'chalk';

export function error(...msg: any[]) {
    // tslint:disable-next-line:no-console
    console.error(chalk.red(...msg));
}

export function specTitle(...msg: any[]) {
    // tslint:disable-next-line:no-console
    console.info(chalk.green(' ---------- ') + chalk.green(...msg) + chalk.green(' ---------- '));
}

export function info(...msg: any[]) {
    // tslint:disable-next-line:no-console
    console.info(`[${formatTimestamp()}]`, ...msg);
}

export const debug = process.env.DEBUG ? debugEnabled : debugNoop;

export function script(...msg: any[]) {
    debug(chalk.dim(msg));
}

function debugEnabled(...msg: any[]) {
    // tslint:disable-next-line:no-console
    console.log(`[${formatTimestamp()}]`, '   ', ...msg);
}

function debugNoop(...msg: any[]) { }

export function formatTimestamp(value?: string | number | Date): string {
    let date = value ? new Date(value) : new Date();
    let time = date.toLocaleTimeString('en-US', { hour12: false });
    let ms = (date.getMilliseconds() + 1000).toString().substr(1);
    return `${time}.${ms}`;
}
