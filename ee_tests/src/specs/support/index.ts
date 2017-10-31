import { browser } from 'protractor';

export enum BrowserMode {
  Phone,
  Tablet,
  Desktop
}

export const WAIT = 3000;
export const LONG_WAIT = 10000;

export function setBrowserMode(mode: BrowserMode): void {

  let window = browser.driver.manage().window();
  switch (mode) {
  case BrowserMode.Phone:
    window.setSize(430, 667);
    break;
  case BrowserMode.Tablet:
    window.setSize(768, 1024);
    break;
  case BrowserMode.Desktop:
    window.setSize(1920, 1080);
    break;
  default:
    throw Error('Unknown mode');
  }
}

export function desktopTestSetup() {
  browser.ignoreSynchronization = true;
  setBrowserMode(BrowserMode.Desktop);
}

/*
 * Joins the arguments as URI paths ensuring there's exactly one '/' between each path entry
 */
  export function joinURIPath (...args: string[]) {
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
