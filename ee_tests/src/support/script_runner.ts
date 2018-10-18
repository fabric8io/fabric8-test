import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { sync as mkdirp } from 'mkdirp';
import { dirname } from 'path';

export async function runScript(
    baseDir: string,
    name: string,
    params: string[],
    outputFile: string,
    outputToConsole: boolean = true,
    timeout: number = timeouts.DEFAULT_WAIT): Promise<void> {

    let runScriptPromise = new Promise<void>((resolve, reject) => {

        logger.info(`Running script \"${name} > ${outputFile}\" from directory ${baseDir}`);

        mkdirp(dirname(outputFile));

        const script = spawn(name, params, { cwd: baseDir });
        const stream = createWriteStream(outputFile);

        script.on('exit', function (code: number) {
            stream.end();
            if (code !== 0) {
                logger.info(`Script \"${name} > ${outputFile}\" exited with code ${code}`);
                reject(`Script \"${name} > ${outputFile}\" exited with non zero value ${code}`);
            } else {
                logger.info('Script finished');
                resolve();
            }
        });

        script.stdout.on('data', (data: any) => {
            if (outputToConsole) {
                logger.script(data);
            }
            stream.write(new Buffer(data));
        });

        script.stderr.on('data', (data: any) => {
            // check if data contains some non-whitespace characters
            if (/\S/.test(data)) {
                logger.error(data);
                stream.write(new Buffer(data));
            }
        });
    });

    let timeoutPromise = new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            reject(`Script \"${name} > ${outputFile}\" exited after timeout of ${timeout / 1000}s`);
        }, timeout);
    });

    return Promise.race([runScriptPromise, timeoutPromise]);
}
