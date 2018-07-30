import * as support from '../support';
import { spawn }  from 'child_process';
import { browser } from 'protractor';

export async function runScript(baseDir: string, name: string, params: string[], outputFile: string): Promise<void> {
    support.info(`Running script \"${name} | tee ${outputFile}\ from directory ${baseDir}`);

    let exitCode: number = 0;
    let finished: boolean = false;

    const script = spawn(name, params, { cwd: baseDir});
    const tee = spawn('tee', [outputFile]);

    script.on('exit', function (code: number, signal: any) {
        if (code !== 0) {
            exitCode = code;
        }
    });

    script.stdout.pipe(tee.stdin);
    script.stderr.pipe(tee.stdin);

    tee.stdout.on('data', (data: any) => {
        support.info(data.toString());
    });

    tee.stderr.on('data', (data: any) => {
        support.info(data.toString());
    });

    tee.on('exit', function (code: number, signal: any) {
        if (code !== 0 && exitCode === 0) {
            exitCode = code;
        }
        finished = true;
    });

    await browser.wait(() => finished === true);

    if (exitCode !== 0) {
        support.info(`Script \"${name} | tee ${outputFile}\" exited with code ${exitCode}`);
        throw new Error(`Script \"${name} | tee ${outputFile}\ exited with non zero value ${exitCode}`);
    } else {
        support.info('Script finished');
    }
}
