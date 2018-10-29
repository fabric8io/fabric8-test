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
    // TODO temporary workaround for a Chrome bug
    // when Protractor clicks on a link that opens in new tab, page doesn't load
    // user sees only blank tab, e.g. when opening OpenShift console or app in stage env
    // https://github.com/fabric8io/fabric8-test/issues/1115
    await browser.sleep(2000);

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

  // close all but main window, main window is managed by Protractor
  async closeAllWindows() {
    await logger.debug('Closing all but main window');
    while (this.windowCount > 1) {
      await this.switchToLastWindow();
      await this.closeCurrentWindow();
    }
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

  async createNewWindow(url: string) {
    logger.debug('Open a new browser tab');
    await browser.executeScript('window.open()');
    await windowManager.switchToNewWindow();
    await browser.get(url);
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
