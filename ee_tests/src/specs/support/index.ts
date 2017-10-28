import { browser } from 'protractor';

export enum BrowserMode {
  Phone,
  Tablet,
  Desktop
}

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

/*
* Get system time in seconds since 1970 - to generate unique space names.
*/
export function returnTime () {

        let month = new Array();
        month[0] = 'jan';
        month[1] = 'feb';
        month[2] = 'mar';
        month[3] = 'apr';
        month[4] = 'may';
        month[5] = 'jun';
        month[6] = 'jul';
        month[7] = 'aug';
        month[8] = 'sep';
        month[9] = 'oct';
        month[10] = 'nov';
        month[11] = 'dec';

        let d = new Date();
        let m = month[d.getMonth()];
        let day = d.getDate();
        let n = d.getTime();

        console.log ('EE test - Creating space: ' + m + day.toString() + n.toString());
        return 'test' +  m + day.toString() + n.toString();
      }

function debugEnabled(...msg: any[]) {
  console.log(`[${new Date().toUTCString()}]:`, ...msg);
}

function debugNoop(...msg: any[]) {}

export const debug = process.env.DEBUG ? debugEnabled : debugNoop;

export const WAIT = 3000;
export const LONG_WAIT = 10000;
