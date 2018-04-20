import CustomReporter = jasmine.CustomReporter;
import CustomReporterResult = jasmine.CustomReporterResult;
import SuiteInfo = jasmine.SuiteInfo;
import RunDetails = jasmine.RunDetails;
import * as fs from 'fs';
import { browser } from 'protractor';

/**
 * Stores results in a file that can be sent into the Zabbix
 *
 * File format:
 * $ZABBIX_HOST $METRIC $ZABBIX_TIMESTAMP $VALLUE
 *
 */
export class ZabbixReporter implements CustomReporter {

    private readonly OUTPUT_DIRECTORY = 'target/zabbix/';

    private readonly HOST = 'unknown';

    private readonly METRIC_PREFIX = 'unknown';

    private records: string[] = [];

    private suiteName = '';

    private suiteStartTime = new Date();

    private specStartTime: Date | undefined;

    private specEndTime: Date | undefined;

    constructor() {
        this.HOST = browser.params.zabbix.host;
        this.METRIC_PREFIX = browser.params.zabbix.metric.prefix;
    }

    public jasmineStarted(suiteInfo: SuiteInfo): void {
        // nothing to do
    }

    public suiteStarted(result: CustomReporterResult) {
        this.suiteName = result.description;
        this.records = [];
        this.suiteStartTime = new Date();
    }

    public specStarted(result: CustomReporterResult) {
        this.specStartTime = new Date();
    }

    public specDone(result: CustomReporterResult) {
        this.specEndTime = new Date();

        let record =
            this.getHost() +
            this.getMetric(result.description) +
            this.getTimestamp() +
            this.getDuration(result.status);
        this.records.push(record);
    }

    public suiteDone(result: CustomReporterResult) {
        if (!fs.existsSync(this.OUTPUT_DIRECTORY)) {
            fs.mkdirSync(this.OUTPUT_DIRECTORY);
        }

        let stream = fs.createWriteStream(this.OUTPUT_DIRECTORY + 'zabbix-report.txt');
        for (let record of this.records) {
            stream.write(new Buffer(record));
        }
        stream.end();
    }

    public jasmineDone(runDetails: RunDetails): void {
        // nothing to do
    }

    private getHost(): string {
        return this.HOST + ' ';
    }

    private getMetric(specName: string): string {
        return this.METRIC_PREFIX + '.' + this.suiteName + '.' + specName + ' ';
    }

    private getTimestamp(): string {
        return this.suiteStartTime.getTime().toString() + ' ';
    }

    private getDuration(status: string | undefined): string {
        if (status === 'passed' || status === 'failed') {
            return this.elapsedTime() + '\n';
        }
        return '0\n';
    }

    private elapsedTime(): number {
        if (this.specStartTime === undefined || this.specEndTime === undefined) {
            return 0;
        }
        return (this.specEndTime.getTime() - this.specStartTime.getTime()) / 1000;
    }
}
