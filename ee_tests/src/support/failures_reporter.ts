import CustomReporter = jasmine.CustomReporter;
import CustomReporterResult = jasmine.CustomReporterResult;
import { createWriteStream } from 'fs';
import { sync as mkdirp } from 'mkdirp';

/**
 * When suite fails, it stores the error message in a file.
 */
export class FailuresReporter implements CustomReporter {

    private readonly OUTPUT_DIRECTORY = 'target/screenshots/';

    private suiteName = '';

    public suiteStarted(result: CustomReporterResult) {
        this.suiteName = result.description;
    }

    public specDone(result: CustomReporterResult) {
        if (result.failedExpectations && result.failedExpectations.length > 0) {
            mkdirp(this.OUTPUT_DIRECTORY);

            let stream = createWriteStream(this.OUTPUT_DIRECTORY + 'failures.txt');

            stream.write(this.suiteName + ' > ' + result.description + '\n');

            for (let expectation of result.failedExpectations) {
                stream.write(new Buffer(expectation.message + '\n'));
            }
            stream.end();
        }
    }
}
