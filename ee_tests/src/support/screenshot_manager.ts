import { sync as mkdirp } from 'mkdirp';
import { browser, logging } from 'protractor';
import { createWriteStream } from 'fs';
import * as logger from '../support/logging';
import * as runner from '../support/script_runner';
import * as timeouts from '../support/timeouts';

class ScreenshotManager {

  private testCounter: number = 0;

  private screenshotCounter: number = 1;

  private path: string;

  constructor(path = 'target/screenshots') {
    this.path = path;
    mkdirp(path);
  }

  async save(name = 'screenshot') {
    try {
      await this.writeScreenshot(this.path + '/' + this.getFormattedCounters() + '-' + name + '.png');
      await this.writePageSource(this.path + '/' + this.getFormattedCounters() + '-' + name + '.html');
      await this.writeBrowserLog(this.path + '/' + this.getFormattedCounters() + '-' + name + '.log');
      await this.writeNetworkLog(this.path + '/' + this.getFormattedCounters() + '-' + name + '.perf.log');
    } catch (e) {
      logger.error('Saving screenshot, page or browser logs failed with error: ' + e);
      await this.desktopScreenshot(this.path + '/' + this.getFormattedCounters() + '-' + name + '-desktop.png');
    } finally {
      this.screenshotCounter++;
    }
  }

  async saveUnformatted(name = 'screenshot') {
    await this.writeScreenshot(this.path + '/' + name + '.png');
    await this.writePageSource(this.path + '/' + name + '.html');
    await this.writeBrowserLog(this.path + '/' + name + '.log');
  }

  nextTest() {
    this.testCounter++;
    this.screenshotCounter = 1;
  }

  private getFormattedCounters() {
    return this.formatCounter(this.testCounter) + '-' + this.formatCounter(this.screenshotCounter);
  }

  private formatCounter(counter: number) {
    return counter.toString().padStart(2, '0');
  }

  private async writeScreenshot(filename: string) {
    return Promise.race([this.writeScreenshotPromise(filename), this.createTimeoutPromise()]);
  }

  private async writeScreenshotPromise(filename: string) {
    logger.debug('Saving screenshot');
    let png = await browser.takeScreenshot();
    let stream = createWriteStream(filename);
    stream.write(new Buffer(png, 'base64'));
    stream.end();
    logger.debug(`Saved screenshot to: ${filename}`);
  }

  private async writePageSource(filename: string) {
    return Promise.race([this.writePageSourcePromise(filename), this.createTimeoutPromise()]);
  }

  private async writePageSourcePromise(filename: string) {
    logger.debug('Saving page source');
    let txt = await browser.getPageSource();
    let stream = createWriteStream(filename);
    stream.write(new Buffer(txt));
    stream.end();
    logger.debug(`Saved page source to: ${filename}`);
  }

  private async writeBrowserLog(filename: string) {
    return Promise.race([this.writeBrowserLogPromise(filename), this.createTimeoutPromise()]);
  }

  private async writeNetworkLog(filename: string) {
    return Promise.race([this.writeNetworkLogPromise(filename), this.createTimeoutPromise()]);
  }

  private async writeBrowserLogPromise(filename: string) {
    logger.debug('Saving browser logs');
    let logs: logging.Entry[] = await browser.manage().logs().get('browser');
    let stream = createWriteStream(filename);

    logs.forEach((entry) => {
      let message = this.hideTokens(entry.message);
      const template = `[${logger.formatTimestamp(entry.timestamp)}] ${entry.level.name} ${message}`;
      if (entry.level.value >= logging.Level.WARNING.value) {
        logger.debug(template);
      }
      stream.write(template + '\n');
    });

    stream.end();
    logger.debug(`Saved browser logs to: ${filename}`);
  }

  private async writeNetworkLogPromise(filename: string) {
    logger.debug('Saving network logs');
    let logs: logging.Entry[] = await browser.manage().logs().get('performance');
    let stream = createWriteStream(filename);

    logs.forEach((entry) => {
      let formattedMessage = this.getFormattedMessage(entry);

      if (formattedMessage !== undefined) {
        stream.write(formattedMessage + '\n');
      }
    });

    stream.end();
    logger.debug(`Saved network logs to: ${filename}`);
  }

  private getFormattedMessage(entry: logging.Entry): string | undefined {
    let message = JSON.parse(entry.message).message;
    let formattedMessage = `[${logger.formatTimestamp(entry.timestamp)}]   req_id:${message.params.requestId}   `;

    switch (message.method) {
      case 'Network.requestWillBeSent': {
        let url = this.hideTokens(message.params.request.url);
        formattedMessage += `[REQUEST]    ${message.params.request.method}   ${url}`;
        break;
      }
      case 'Network.responseReceived': {
        let response = message.params.response;
        let url = this.hideTokens(response.url);
        formattedMessage += `[RESPONSE]   ${response.status}   ${response.statusText}   ${url}`;
        break;
      }
      case 'Network.webSocketCreated': {
        let url = this.hideTokens(message.params.url);
        formattedMessage += `[WEBSOCKET_CREATED]    ${url}`;
        break;
      }
      case 'Network.webSocketFrameSent': {
        formattedMessage += `[WEBSOCKET_REQUEST]    ${message.params.response.payloadData}`;
        break;
      }
      case 'Network.webSocketFrameReceived': {
        formattedMessage += `[WEBSOCKET_RESPONSE]   ${message.params.response.payloadData}`;
        break;
      }
      default : return undefined;
    }

    return formattedMessage;
  }

  private async desktopScreenshot(fileName: string) {
    try {
      logger.debug(`Save desktop screenshot`);
      await runner.runScript(
        '.', // working directory
        './take-screenshot.sh', // script
        [fileName], // params
        `./target/screenshots/desktopScreenshot.txt`,  // output file
        false,
        timeouts.LONGER_WAIT
      );
      logger.debug(`Save desktop screenshot saved`);
    } catch (e) {
      logger.error('Save desktop screenshot failed with error: ' + e);
    }
  }

  private createTimeoutPromise(): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
          reject(`Saving resources exited after timeout of ${timeouts.DEFAULT_WAIT / 1000}s`);
      }, timeouts.DEFAULT_WAIT);
    });
  }

  // hide JWT tokens in URL parameters
  private hideTokens(input: string): string {
    return input.replace(/([?&_])(token[a-zA-Z0-9_]*=)[a-zA-Z0-9\._\-%]+/g, '$1$2<hidden>');
  }
}

export let screenshotManager: ScreenshotManager = new ScreenshotManager();
