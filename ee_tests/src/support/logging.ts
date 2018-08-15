import * as colors from 'colors';

export function error(...msg: any[]) {
    // tslint:disable-next-line:no-console
    console.error(colors.red(...msg));
}

export function specTitle(...msg: any[]) {
    // tslint:disable-next-line:no-console
    console.info(colors.green(' ---------- ') + colors.green(...msg) + colors.green(' ---------- '));
}

export function info(...msg: any[]) {
    // tslint:disable-next-line:no-console
    console.info(`[${timestamp()}]:`, ...msg);
}

export const debug = process.env.DEBUG ? debugEnabled : debugNoop;

export function script(...msg: any[]) {
    debug(colors.dim(msg));
}

function debugEnabled(...msg: any[]) {
    // tslint:disable-next-line:no-console
    console.log(`[${timestamp()}]:`, '   ', ...msg);
}

function debugNoop(...msg: any[]) { }

function timestamp(): string {
    let date = new Date();
    let time = date.toLocaleTimeString('en-US', { hour12: false });
    let ms = (date.getMilliseconds() + 1000).toString().substr(1);
    return `${time}.${ms}`;
}
