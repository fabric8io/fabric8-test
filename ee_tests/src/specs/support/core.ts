import { browser } from 'protractor';
import * as fs from 'fs';


export enum BrowserMode {
  Phone,
  Tablet,
  Desktop
}

export const seconds = (n: number) => n * 1000;
export const minutes = (n: number) => n * seconds(60);

export const DEFAULT_WAIT = seconds(30);
export const LONG_WAIT = minutes(1);
export const LONGEST_WAIT = minutes(15);

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
    await window.setSize(1920, 900);
    break;
  default:
    throw Error('Unknown mode');
  }
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


/**
 * Get system time in seconds since 1970 - to generate unique space names.
 */
export function newSpaceName(): string {
  let d = new Date();
  let month = d.toLocaleString('en-US', {month: 'short'}).toLowerCase();
  let day = d.getDate();
  let time = d.getTime();
  let spaceName = `test${month}${day}${time}`;

  info('New space name: ', spaceName);
  return spaceName;
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

