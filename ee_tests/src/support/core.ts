import { browser, Key } from 'protractor';
import * as fs from 'fs';
import { SpacePipelinePage } from '../page_objects/space_pipeline.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';

export enum BrowserMode {
  Phone,
  Tablet,
  Desktop
}

export const seconds = (n: number) => n * 1000;
export const minutes = (n: number) => n * seconds(60);

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
export async function printTerminal (spaceCheWorkspacePage: SpaceCheWorkspacePage, textToPrint: string) {
  await browser.driver.actions().mouseDown(spaceCheWorkspacePage.bottomPanelTerminal).click().sendKeys(' ').perform();
  await browser.driver.actions().mouseDown(spaceCheWorkspacePage.bottomPanelTerminal).click().sendKeys(textToPrint).perform();
  await browser.driver.actions().mouseDown(spaceCheWorkspacePage.bottomPanelTerminal).click().sendKeys(Key.ENTER).perform();
  await browser.driver.actions().mouseDown(spaceCheWorkspacePage.bottomPanelTerminal).click().sendKeys(Key.ENTER).perform();
}
// tslint:enable:max-line-length

/*
 * Display the contents of the Jenkins build log.
 */
export async function dumpLog (spacePipelinePage: SpacePipelinePage) {
  await spacePipelinePage.viewLog.clickWhenReady();
  let handles = await browser.getAllWindowHandles();

  /* Switch to the build log browser window */
  await browser.switchTo().window(handles[1]);
  await spacePipelinePage.loginWithOpenshift.clickWhenReady();

//  handles = await browser.getAllWindowHandles();
  let theText = await spacePipelinePage.buildLogOutput.getText();
  await console.log ('\n ============ End of test reached, Jenkins Build Log ============ \n');
  await console.log (theText);
  expect (await theText).toContain('Finished: SUCCESS');

  await browser.switchTo().window(handles[0]);
}

/*
 * Display the contents of the Jenkins build log.
 */
export async function dumpLog2 (spacePipelinePage: SpacePipelinePage, spaceName: string) {

  // tslint:disable:max-line-length

  // open build log URL - and then
  //   https://jenkins-ldimaggi-osiotest1-jenkins.8a09.starter-us-east-2.openshiftapps.com/job/osiotestmachine/job/dec21/job/master/1/console
  //   https://jenkins-ldimaggi-osiotest1-jenkins.1b7d.free-stg.openshiftapps.com/job/osiotestmachine/job/testjan5/job/master/1/console

  let theUrl = 'https://jenkins-' + browser.params.login.user + '-jenkins.8a09.starter-us-east-2.openshiftapps.com/job/' + browser.params.github.username + '/job/' + spaceName + '/job/master/1/console';

  if (browser.params.target.url === 'https://prod-preview.openshift.io') {
    theUrl = 'https://jenkins-' + browser.params.login.user + '-jenkins.1b7d.free-stg.openshiftapps.com/job/' + browser.params.github.username + '/job/' + spaceName + '/job/master/1/console';
  }

  await browser.get(theUrl);
//  await browser.sleep(30000);
  await spacePipelinePage.loginWithOpenshift.clickWhenReady(LONGER_WAIT);

  if (browser.params.target.url === 'https://prod-preview.openshift.io') {
    await spacePipelinePage.keyCloakButton.clickWhenReady(LONGER_WAIT);
  }

  await browser.sleep(30000);
  let theText = await spacePipelinePage.buildLogOutput.getText();
  await console.log ('\n ============ End of test reached, Jenkins Build Log ============ \n');
  await console.log (theText);
//  expect (await theText).toContain('Finished: SUCCESS');

  let handles = await browser.getAllWindowHandles();
  await browser.switchTo().window(handles[0]);



  // tslint:enable:max-line-length
}


export async function desktopTestSetup() {
  browser.ignoreSynchronization = true;
  await setBrowserMode(BrowserMode.Desktop);
}

/*
 * Joins the arguments as URI paths ensuring there's exactly one '/' between each path entry
 */
  export function joinURIPath (...args: string[]) {
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
    let d = new Date();
    let month = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    let day = d.getDate();
    let time = d.getTime();
    let spaceName = `test${month}${day}${time}`;

    info('New space name: ', spaceName);

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

/**
 * Write screenshot to file
 * Example usage:
 *   support.writeScreenshot('exception1.png');
 *
 * Ref: http://blog.ng-book.com/taking-screenshots-with-protractor/
 */
export async function writeScreenshot(filename: string) {
  let png = await browser.takeScreenshot();
  let stream = fs.createWriteStream(filename);
  stream.write(new Buffer(png, 'base64'));
  stream.end();
  info(`Saved screenshot to: ${filename}`);
}

function timestamp(): string {
  let date = new Date();
  let time = date.toLocaleTimeString('en-US', {hour12: false});
  let ms = (date.getMilliseconds() + 1000).toString().substr(1);
  return `${time}.${ms}`;
}

function debugEnabled(...msg: any[]) {
  console.log(`[${timestamp()}]:`, ...msg);
}

function debugNoop(...msg: any[]) {}

export function info(...msg: any[]) {
  console.info(`[${timestamp()}]:`, ...msg);
}

export const debug = process.env.DEBUG ? debugEnabled : debugNoop;


/**
 * Returns the entity name of the current user which is used in the URL after, say,
 * https:///openshift.io/{userEntityName}/{spaceName}
 *
 * This name may not be the same as the user name due to special characters (e.g. email addresses or underscores).
 *
 * When using fabric8 on MiniShift then this is typically 'developer' for the `oc whoami` rather than
 * the user name used to login into GitHub
 */
export function userEntityName(username?: string) {

  // lets try use the $OSO_USERNAME for the openshift `whoami` name first
  let osoUsername = browser.params.oso.username;
  if (osoUsername) {
    return osoUsername;
  }

  let platform = targetPlatform();
  if (platform === 'fabric8-openshift') {
    return browser.params.login.openshiftUser || 'developer';
  }

  return username ? username : browser.params.login.user;
}

/**
 * Returns the platform name which is either
 * * "osio" for testing on https://openshift.io/
 * * "fabric8-openshift" for testing
 * * "fabric8-kubernetes" for testing fabric8 on a kubernetes cluster
 */
// TODO: convert this to return a TargetClass that encapsulates data
// about the target platform
export function targetPlatform(): string {
  const target: any = browser.params.target;

  // in the absense of a target, the testTarget is osio
  if (!target) {
    return 'osio';
  }

  // if platform is set explicitly then it takes precedence
  const platform: any = target.platform;
  if (platform) {
    return platform;
  }

  // try to guess from the url
  const url: string|undefined = target.url;

  if (url === 'https://openshift.io' ||
      url === 'https://openshift.io/' ||
      url === 'https://prod-preview.openshift.io' ||
      url === 'https://prod-preview.openshift.io/') {
    return 'osio';
  }

  // lets assume fabric8 on openshift as its better
  // than assuming OSIO when not using OSIO :)
  return 'fabric8-openshift';
}

