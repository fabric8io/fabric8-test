import * as support from '../support';
import { spawn } from 'child_process';
import { browser } from 'protractor';
import { createWriteStream } from 'fs';

export async function runScript(
    baseDir: string,
    name: string,
    params: string[],
    outputFile: string,
    outputToConsole: boolean = true,
    timeout?: number): Promise<void> {

    support.info(`Running script \"${name} > ${outputFile}\" from directory ${baseDir}`);

    let exitCode: number = 0;
    let finished: boolean = false;

    const script = spawn(name, params, { cwd: baseDir });
    const stream = createWriteStream(outputFile);

    script.on('exit', function (code: number, signal: any) {
        stream.end();
        exitCode = code;
        finished = true;
    });

    script.stdout.on('data', (data: any) => {
        if (outputToConsole) {
            support.script(data);
        }
        stream.write(new Buffer(data));
    });

    script.stderr.on('data', (data: any) => {
        // check if data contains some non-whitespace characters
        if (/\S/.test(data)) {
            support.error(data);
            stream.write(new Buffer(data));
        }
    });

    await browser.wait(() => finished === true, timeout,
        `Script \"${name} > ${outputFile}\" did not finish`);

    if (exitCode !== 0) {
        support.info(`Script \"${name} > ${outputFile}\" exited with code ${exitCode}`);
        throw new Error(`Script \"${name} > ${outputFile}\" exited with non zero value ${exitCode}`);
    } else {
        support.info('Script finished');
    }
}
