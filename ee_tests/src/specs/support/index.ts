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


function debugEnabled(...msg: any[]) {
  console.log(`[${new Date().toUTCString()}]:`, ...msg);
}

function debugNoop(...msg: any[]) {}

export const debug = process.env.DEBUG ? debugEnabled : debugNoop;
