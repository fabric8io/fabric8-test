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
    logger.debug('Saving screenshot');
    let png = await browser.takeScreenshot();
    let stream = createWriteStream(filename);
    stream.write(new Buffer(png, 'base64'));
    stream.end();
    logger.debug(`Saved screenshot to: ${filename}`);
  }

  private async writePageSource(filename: string) {
    logger.debug('Saving page source');
    let txt = await browser.getPageSource();
    let stream = createWriteStream(filename);
    stream.write(new Buffer(txt));
    stream.end();
    logger.debug(`Saved page source to: ${filename}`);
  }

  private async writeBrowserLog(filename: string) {
    logger.debug('Saving browser logs');
    let logs: logging.Entry[] = await browser.manage().logs().get('browser');
    let stream = createWriteStream(filename);

    logs.forEach((entry) => {
      const template = `[${logger.formatTimestamp(entry.timestamp)}] ${entry.level.name} ${entry.message}`;
      if (entry.level.value >= logging.Level.WARNING.value) {
        logger.debug(template);
      }
      stream.write(template + '\n');
    });

    stream.end();
    logger.debug(`Saved browser logs to: ${filename}`);
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
}

export let screenshotManager: ScreenshotManager = new ScreenshotManager();
