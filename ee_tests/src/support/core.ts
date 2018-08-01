import { browser, by, element, ElementFinder, ExpectedConditions as until, Key } from 'protractor';
import { createWriteStream } from 'fs';
import * as support from '../support';
import { SpacePipelinePage } from '../page_objects/space_pipeline_tab.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { BoosterEndpoint } from '../page_objects/booster_endpoint.page';
import { Button } from '../ui/button';
import { CodebasesPage } from '../page_objects/space_codebases.page';
import { Quickstart } from './quickstart';

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

/* Modified test source code */
export const FILETEXT: string = `package io.openshift.booster;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.StaticHandler;
import static io.vertx.core.http.HttpHeaders.CONTENT_TYPE;

public class HttpApplication extends AbstractVerticle {
  static final String template = "Howdee, %s!";

  @Override
  public void start(Future<Void> future) {
    // Create a router object.
    Router router = Router.router(vertx);

    router.get("/api/greeting").handler(this::greeting);
    router.get("/*").handler(StaticHandler.create());

    // Create the HTTP server and pass the "accept" method to the request handler.
    vertx
        .createHttpServer()
        .requestHandler(router::accept)
        .listen(
            // Retrieve the port from the configuration, default to 8080.
            config().getInteger("http.port", 8080), ar -> {
              if (ar.succeeded()) {
                System.out.println("Server started on port " + ar.result().actualPort());
              }
              future.handle(ar.mapEmpty());
            });
  }

  private void greeting(RoutingContext rc) {
    String name = rc.request().getParam("name");
    if (name == null) {
      name = "World";
    }
    JsonObject response = new JsonObject()
        .put("content", String.format(template, name));
    rc.response()
        .putHeader(CONTENT_TYPE, "application/json; charset=utf-8")
        .end(response.encodePrettily());
  }
}
`;

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
    const month = (d.getMonth() < 9) ? `0${d.getMonth() + 1}` : `${d.getMonth() + 1}`;
    const day = (d.getDate() < 10) ? `0${d.getDate()}` : `${d.getDate()}`;
    const hour = (d.getHours() < 10) ? `0${d.getHours()}` : `${d.getHours()}`;
    const minute = (d.getMinutes() < 10) ? `0${d.getMinutes()}` : `${d.getMinutes()}`;
    const second = (d.getSeconds() < 10) ? `0${d.getSeconds()}` : `${d.getSeconds()}`;
    const spaceName = `e2e-${month}${day}-${hour}${minute}${second}`;
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

export async function sleep(ms: number) {
  info('Sleeping for ' + ms + ' ms...');
  return new Promise(resolve => setTimeout(resolve, ms));
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
  info(`Saved screenshot to: ${filename}`);
}

/**
 * Store the page source
 */
export async function writePageSource(filename: string) {
  let txt = await browser.getPageSource();
  let stream = createWriteStream(filename);
  stream.write(new Buffer(txt));
  stream.end();
  info(`Saved page source to: ${filename}`);
}

/**
 * Store the page source
 */
export async function writeText(filename: string, text: string) {
  info(`Saving text to: ${filename}`);
  let stream = createWriteStream(filename);
  stream.write(new Buffer(text));
  stream.end();
  info(`Saved text to: ${filename}`);
}

function timestamp(): string {
  let date = new Date();
  let time = date.toLocaleTimeString('en-US', { hour12: false });
  let ms = (date.getMilliseconds() + 1000).toString().substr(1);
  return `${time}.${ms}`;
}

function debugEnabled(...msg: any[]) {
  // tslint:disable-next-line:no-console
  console.log(`[${timestamp()}]:`, ...msg);
}

function debugNoop(...msg: any[]) { }

export function info(...msg: any[]) {
  // tslint:disable-next-line:no-console
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
  const url: string | undefined = target.url;

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

/* Open the selected codebases page */
export async function openCodebasesPage(osioUrl: string, userName: string, spaceName: string) {
  let theUrl: string = osioUrl + '\/' + userName + '\/' + spaceName + '\/create';
  await browser.get(theUrl);
}

/* Open the selected codebases page */
export async function openPipelinesPage(osioUrl: string, userName: string, spaceName: string) {
  let theUrl: string = osioUrl + '\/' + userName + '\/' + spaceName + '\/create\/pipelines';
  await browser.get(theUrl);
}

/* Toggle automatic parans and braces in Che editor */
export async function togglePreferences(spaceCheWorkSpacePage: SpaceCheWorkspacePage) {

  await spaceCheWorkSpacePage.cheProfileGroup.clickWhenReady();
  await spaceCheWorkSpacePage.chePreferences.clickWhenReady();
  await spaceCheWorkSpacePage.chePreferencesEditor.clickWhenReady();
  await spaceCheWorkSpacePage.chePreferencesAutopairParen.untilPresent(support.LONGEST_WAIT);
  await spaceCheWorkSpacePage.chePreferencesAutoBraces.untilPresent(support.LONGEST_WAIT);

  await spaceCheWorkSpacePage.chePreferencesAutopairParen.clickWhenReady();
  await spaceCheWorkSpacePage.chePreferencesAutoBraces.clickWhenReady();
  await spaceCheWorkSpacePage.chePreferencesStoreChanges.clickWhenReady();

  await spaceCheWorkSpacePage.chePreferencesClose.clickWhenReady();

  // TO DO - verify preferences dialog is closed
  await browser.wait(until.not(until.presenceOf(spaceCheWorkSpacePage.chePreferencesClose)));
}

// tslint:disable:max-line-length

/* Run the booster by means of the Che run menu */
export async function runBooster(spaceCheWorkSpacePage: SpaceCheWorkspacePage, expectedString: string) {
  try {

    /* Remote sites (Brno) are experiencing issues where the run button is active before
       the project os fully downloaded - and run is attempted before the pom file is present */
    try {
      await spaceCheWorkSpacePage.walkTree(support.currentSpaceName());
      await browser.wait(until.visibilityOf(spaceCheWorkSpacePage.cheFileName('pom.xml')), support.DEFAULT_WAIT);
    } catch (e) {
      support.info('Exception in Che project directory tree = ' + e);
    }

    await spaceCheWorkSpacePage.mainMenuRunButton.clickWhenReady(support.LONGEST_WAIT);
    await spaceCheWorkSpacePage.mainMenuRunButtonRunSelection.clickWhenReady(support.LONGEST_WAIT);
    await spaceCheWorkSpacePage.bottomPanelRunTab.clickWhenReady(support.LONGEST_WAIT);
    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelCommandConsoleLines, expectedString), support.LONGER_WAIT);
    let textStr = await spaceCheWorkSpacePage.bottomPanelCommandConsoleLines.getText();
    support.info('Output from run = ' + textStr);
    expect(await spaceCheWorkSpacePage.bottomPanelCommandConsoleLines.getText()).toContain(
      new Quickstart(browser.params.quickstart.name).runtime.quickstartStartedTerminal
    );
  } catch (e) {
    support.info('Exception running booster = ' + e);
  }
}

/* Access the deployed app's Che preview endpoint, send text, invoke the app, return the output */
export async function invokeApp(boosterEndpointPage: BoosterEndpoint, mySpaceCheWorkSpacePage: SpaceCheWorkspacePage, username: string, screenshotName: string, inputString: string, expectedString: string, spaceCheWorkSpacePage: SpaceCheWorkspacePage) {

  /// TODO - The link to the deployed app is present before the endpoint is available
  await browser.sleep(10000);
  await mySpaceCheWorkSpacePage.previewLink(username).clickWhenReady();

  /* A new browser window is opened when Che opens the app endpoint */
  let handles = await browser.getAllWindowHandles();
  await browser.wait(windowManager.windowCountCondition(handles.length), support.DEFAULT_WAIT);
  handles = await browser.getAllWindowHandles();
  support.debug('Number of browser tabs after opening Che app window = ' + handles.length);

  /* Switch to the newly opened Che deployed endpoint browser window */
  await browser.switchTo().window(handles[handles.length - 1]);

  /* Invoke the deployed app */
  try {
    await boosterEndpointPage.nameText.clickWhenReady();
    await boosterEndpointPage.nameText.sendKeys(inputString);
    support.writeScreenshot('target/screenshots/che_edit_' + screenshotName + '_' + support.currentSpaceName() + '.png');
    await boosterEndpointPage.invokeButton.clickWhenReady(support.LONGEST_WAIT);

    let expectedOutput = '{"content":"' + expectedString + '"}';
    await browser.wait(until.textToBePresentInElement(boosterEndpointPage.stageOutput, expectedOutput), support.DEFAULT_WAIT);
    expect(await boosterEndpointPage.stageOutput.getText()).toBe(expectedOutput);
  } catch (e) {
    support.info('Exception invoking staged app = ' + e);
  }
}

/* Find the project in the project tree */
export async function findProjectInTree(spaceCheWorkSpacePage: SpaceCheWorkspacePage) {

  support.writeScreenshot('target/screenshots/che_workspace_partb_' + support.currentSpaceName() + '.png');
  let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(support.currentSpaceName()), 'Project in Che Tree');
  await projectInCheTree.untilPresent(support.LONGEST_WAIT);
  await support.debug(spaceCheWorkSpacePage.recentProjectRootByName(support.currentSpaceName()).getText());
  support.writeScreenshot('target/screenshots/che_workspace_partc_' + support.currentSpaceName() + '.png');
}

/* Open the codebase page, and then open the Che workspace */
export async function openCodebasePageSwitchWindow(spaceChePage: CodebasesPage) {

  /* Open the codebase page and the workspace in Che */
  await openCodebasesPage(browser.params.target.url, browser.params.login.user, support.currentSpaceName());
  //    let spaceChePage = new SpaceChePage();
  await codebaseOpenButton(browser.params.login.user, support.currentSpaceName()).clickWhenReady();

  /* A new browser window is opened when Che opens */
  await windowManager.switchToWindow(2, 1);
}

/* 'Open' button for existing codebase */
function codebaseOpenButton(githubUsername: string, spaceName: string): ElementFinder {
  let xpathString = './/button[contains(text(),\'Open\')]';
  return new Button(element(by.xpath(xpathString)), 'Open codebase button');
}

export class ScreenshotManager {

  private testCounter: number = 0;

  private screenshotCounter: number = 1;

  async writeScreenshot(name = 'screenshot', path = 'target/screenshots') {
    await writeScreenshot(path + '/' + this.getFormattedCounters() + '-' + name + '.png');
    await writePageSource(path + '/' + this.getFormattedCounters() + '-' + name + '.html');
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
  }

  async switchToNewWindow() {
    this.windowCount++;
    await this.switchToWindow(this.windowCount, this.windowCount - 1);
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

  windowCountCondition(count: number) {
    return function () {
      return browser.getAllWindowHandles().then(function (handles) {
        return handles.length === count;
      });
    };
  }
}

export let windowManager: WindowManager = new WindowManager();
