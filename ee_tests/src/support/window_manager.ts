import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import { browser } from 'protractor';

export class WindowManager {

  private windowCount = 1;

  async switchToMainWindow() {
    await logger.debug('Window changing to index 0 (main window)');
    let handles = await browser.getAllWindowHandles();
    await browser.switchTo().window(handles[0]);
    await logger.debug('Window changed to index 0 (main window)');
  }

  async switchToLastWindow() {
    await this.switchToWindow(this.windowCount, this.windowCount - 1);
    await this.checkWindowCount();
  }

  async switchToNewWindow() {
    this.windowCount++;
    await this.switchToWindow(this.windowCount, this.windowCount - 1);
    await this.checkWindowCount();
  }

  async closeCurrentWindow() {
    await logger.debug('Closing current window');
    await browser.close();
    this.windowCount--;
    await this.switchToMainWindow();
    await this.checkWindowCount();
  }

  async switchToWindow(expectedWindowCount: number, windowIndex: number) {
    await logger.debug('Waiting for the specified number or windows to be present: ' + this.windowCount);
    await browser.wait(this.windowCountCondition(expectedWindowCount),
      timeouts.DEFAULT_WAIT, 'Browser has ' + expectedWindowCount + ' windows');

    await logger.debug('Window changing to index ' + windowIndex);
    let handles = await browser.getAllWindowHandles();
    await logger.debug('Switching to handle: ' + handles[windowIndex]);
    await browser.switchTo().window(handles[windowIndex]);
    await logger.debug('Window changed to index ' + windowIndex);
  }

  async checkWindowCount() {
    let handles = await browser.getAllWindowHandles();
    if (this.windowCount !== handles.length) {
      throw `Unexpected window count. Expected: ${this.windowCount}, real: ${handles.length}`;
    }
  }

  windowCountCondition(count: number) {
    return function () {
      return browser.getAllWindowHandles().then(function (handles) {
        return handles.length === count;
      });
    };
  }

  getWindowCount() {
    return this.windowCount;
  }
}

export let windowManager: WindowManager = new WindowManager();
