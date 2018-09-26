import { browser, by, element, Key, logging } from 'protractor';
import { createWriteStream } from 'fs';
import * as support from '../support';
import { SpacePipelinePage } from '../page_objects/space_pipeline_tab.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { Button } from '../ui/button';
import * as mkdirp from 'mkdirp';

export enum BrowserMode {
  Phone,
  Tablet,
  Desktop
}

export const seconds = (n: number) => n * 1000;
export const minutes = (n: number) => n * seconds(60);

export const DEFAULT_WAIT_PAGE_LOAD = seconds(10);
export const DEFAULT_WAIT = seconds(60);
export const LONG_WAIT = minutes(1);
export const LONGER_WAIT = minutes(10);
export const LONGEST_WAIT = minutes(30);

export async function setBrowserMode(mode: BrowserMode) {
  let window = browser.driver.manage().window();
  switch (mode) {
    case BrowserMode.Phone:
      await window.setSize(430, 667);
      break;
    case BrowserMode.Tablet:
      await window.setSize(768, 1024);
      break;
    case BrowserMode.Desktop:
      await window.setSize(1920, 1080);
      break;
    default:
      throw Error('Unknown mode');
  }
}

/* Print text to the Che Terminal window - a 2nd RETURN char is used to make the text easier to read */
// tslint:disable:max-line-length
export async function printTerminal(spaceCheWorkspacePage: SpaceCheWorkspacePage, textToPrint: string) {
  await browser.driver.actions().mouseDown(spaceCheWorkspacePage.bottomPanelTerminal).click().sendKeys(' ').perform();
  await browser.driver.actions().mouseDown(spaceCheWorkspacePage.bottomPanelTerminal).click().sendKeys(textToPrint).perform();
  await browser.driver.actions().mouseDown(spaceCheWorkspacePage.bottomPanelTerminal).click().sendKeys(Key.ENTER).perform();
  await browser.driver.actions().mouseDown(spaceCheWorkspacePage.bottomPanelTerminal).click().sendKeys(Key.ENTER).perform();
}
// tslint:enable:max-line-length

/*
 * Display the contents of the Jenkins build log.
 */
export async function dumpLog2(spacePipelinePage: SpacePipelinePage, spaceName: string) {

  // tslint:disable:max-line-length

  // open build log URL - and then
  //   https://jenkins-ldimaggi-osiotest1-jenkins.8a09.starter-us-east-2.openshiftapps.com/job/osiotestmachine/job/dec21/job/master/1/console
  //   https://jenkins-ldimaggi-osiotest1-jenkins.1b7d.free-stg.openshiftapps.com/job/osiotestmachine/job/testjan5/job/master/1/console

  // tslint:enable:max-line-length

  let theUrl = 'https://jenkins-' + browser.params.login.user +
    '-jenkins.8a09.starter-us-east-2.openshiftapps.com/job/' + browser.params.github.username +
    '/job/' + spaceName + '/job/master/1/console';

  if (browser.params.target.url === 'https://prod-preview.openshift.io') {
    theUrl = 'https://jenkins-' + browser.params.login.user +
    '-jenkins.1b7d.free-stg.openshiftapps.com/job/' + browser.params.github.username +
    '/job/' + spaceName + '/job/master/1/console';
  }

  await browser.get(theUrl);
  //  await browser.sleep(30000);
  let loginWithOpenshift = new Button(element(by.xpath('.//*[contains(text(),\'Login with OpenShift\')]')),
    'Login with OpenShift');
  await loginWithOpenshift.clickWhenReady(LONGER_WAIT);

  if (browser.params.target.url === 'https://prod-preview.openshift.io') {
    let keyCloakButton = new Button(element(by.xpath('.//*[@class=\'login-redhat keycloak\']')),
      'Login with Keycloak button');
    await keyCloakButton.clickWhenReady(LONGER_WAIT);
  }

  await browser.sleep(30000);
  let buildLogOutput = element(by.xpath('.//*[contains(@class, \'console-output\')]'));
  let theText = await buildLogOutput.getText();
  // TODO we should refactor or remove this function
  // tslint:disable:no-console
  await console.log('\n ============ End of test reached, Jenkins Build Log ============ \n');
  await console.log(theText);
  // tslint:disable:no-console
  //  expect (await theText).toContain('Finished: SUCCESS');

  let handles = await browser.getAllWindowHandles();
  await browser.switchTo().window(handles[0]);
}

export async function desktopTestSetup() {
  browser.ignoreSynchronization = true;
  await setBrowserMode(BrowserMode.Desktop);
}

/*
 * Joins the arguments as URI paths ensuring there's exactly one '/' between each path entry
 */
export function joinURIPath(...args: string[]) {
  // TODO: improve this method using available modules for uri operations

  let answer = null;
  for (let i = 0, j = arguments.length; i < j; i++) {
    let arg = arguments[i];
    if (i === 0 || !answer) {
      answer = arg;
    } else {
      if (!answer.endsWith('/')) {
        answer += '/';
      }
      if (arg.startsWith('/')) {
        arg = arg.substring(1);
      }
      answer += arg;
    }
  }
  return answer;
}

export class SpaceName {
  static spaceName: string;

  static newSpaceName(): string {
    const d = new Date();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');
    const randomNumber = Math.round(Math.random() * 10000);
    const spaceName = `e2e-${month}${day}-${hour}${minute}-${randomNumber}`;
    support.info('New space name: ', spaceName);

    SpaceName.spaceName = spaceName;
    return SpaceName.spaceName;
  }
}

/**
 * Get system time in seconds since 1970 - to generate unique space names.
 */
export function newSpaceName(): string {
  return SpaceName.newSpaceName();
}

export function currentSpaceName(): string {
  return SpaceName.spaceName;
}

export class CheWorkspace {
  static wsName: string;
  static url: string;
}

export function currentCheWorkspaceUrl(): string {
  return CheWorkspace.url;
}

export function updateCheWorkspaceUrl(url: string) {
  CheWorkspace.url = url;
}

export class RepoName {
  static repoName: string;
}

export function currentRepoName(): string {
  let configuredRepoName = browser.params.github.repo;
  if (RepoName.repoName === undefined) {
    if (configuredRepoName !== '') {
      RepoName.repoName = configuredRepoName;
    } else {
      RepoName.repoName = support.currentSpaceName();
    }
  }
  return RepoName.repoName;
}

export function updateCurrentRepoName(repoName: string) {
  RepoName.repoName = repoName;
}

/**
 * Write screenshot to file
 * Example usage:
 *   support.writeScreenshot('exception1.png');
 *
 * Ref: http://blog.ng-book.com/taking-screenshots-with-protractor/
 */
export async function writeScreenshot(filename: string) {
  let png = await browser.takeScreenshot();
  let stream = createWriteStream(filename);
  stream.write(new Buffer(png, 'base64'));
  stream.end();
  support.debug(`Saved screenshot to: ${filename}`);
}

export async function writePageSource(filename: string) {
  let txt = await browser.getPageSource();
  let stream = createWriteStream(filename);
  stream.write(new Buffer(txt));
  stream.end();
  support.debug(`Saved page source to: ${filename}`);
}

export async function writeBrowserLog(filename: string) {
  let logs: logging.Entry[] = await browser.manage().logs().get('browser');
  let stream = createWriteStream(filename);

  logs.forEach((entry) => {
    const template = `[${support.formatTimestamp(entry.timestamp)}] ${entry.level.name} ${entry.message}`;
    if (entry.level.value >= logging.Level.WARNING.value) {
      console.log(template);
    }
    stream.write(template + '\n');
  });

  stream.end();
  support.debug(`Saved browser logs to: ${filename}`);
}

export class ScreenshotManager {

  private testCounter: number = 0;

  private screenshotCounter: number = 1;

  private path: string;

  constructor(path = 'target/screenshots') {
    this.path = path;
    mkdirp.sync(path);
  }

  async writeScreenshot(name = 'screenshot') {
    await writeScreenshot(this.path + '/' + this.getFormattedCounters() + '-' + name + '.png');
    await writePageSource(this.path + '/' + this.getFormattedCounters() + '-' + name + '.html');
    await writeBrowserLog(this.path + '/' + this.getFormattedCounters() + '-' + name + '.log');
    this.screenshotCounter++;
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
}

export let screenshotManager: ScreenshotManager = new ScreenshotManager();

export class WindowManager {

  private windowCount = 1;

  async switchToMainWindow() {
    await support.debug('Window changing to index 0 (main window)');
    let handles = await browser.getAllWindowHandles();
    await browser.switchTo().window(handles[0]);
    await support.debug('Window changed to index 0 (main window)');
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
    await support.debug('Closing current window');
    await browser.close();
    this.windowCount--;
    await this.switchToMainWindow();
    await this.checkWindowCount();
  }

  async switchToWindow(expectedWindowCount: number, windowIndex: number) {
    await support.debug('Waiting for the specified number or windows to be present: ' + this.windowCount);
    await browser.wait(this.windowCountCondition(expectedWindowCount),
      support.DEFAULT_WAIT, 'Browser has ' + expectedWindowCount + ' windows');

    await support.debug('Window changing to index ' + windowIndex);
    let handles = await browser.getAllWindowHandles();
    await support.debug('Switching to handle: ' + handles[windowIndex]);
    await browser.switchTo().window(handles[windowIndex]);
    await support.debug('Window changed to index ' + windowIndex);
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
