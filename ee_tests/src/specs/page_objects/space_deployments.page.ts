/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/
// tslint:disable:max-line-length
import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder, ElementArrayFinder } from 'protractor';
// tslint:ensable:max-line-length
import { AppPage } from './app.page';
import { TextInput, Button } from '../ui';
import { SpaceHeader } from './app/spaceHeader';

export class SpaceDeploymentsPage extends AppPage {

  spaceHeader = new SpaceHeader(this.appTag.$('header > alm-app-header > nav'));

  /* All resource cards in the Deployments page */
  allResourceCards = element.all (by.xpath('.//*[contains (@class,\'card-pf\')]'));
  firstResourceCards = element.all (by.xpath('.//*[contains (@class,\'card-pf\')]')).first;
  lastResourceCards = element.all (by.xpath('.//*[contains (@class,\'card-pf\')]')).last;

  resourceUsageToggle = new Button (element (by.xpath('.//*[contains(@class,\'resource-title\')]')), 'Resource Uage Toggle');

  /* Resource card by index */
  resourceCardByIndex (indexValue: number): ElementFinder {
    let xpathString = '(.//*[contains (@class,\'card-pf\')])[' + indexValue + ']';
    return element(by.xpath(xpathString));
  }

  /* Deployment resource cards */

  /* Resource card by deployment name and index (stage=1, run=2) */
  resourceCardByNameAndIndex (nameString: string, indexValue: number): ElementFinder {
    let xpathString = '(.//*[@id=\'deploymentCardApplicationTitle\'][contains(text(),\'' + nameString + '\')]/../../deployment-card)[' + indexValue + ']';
    return element(by.xpath(xpathString));
  }

  /*  Deployment status icon by deployment name and index (stage=1, run=2) */
  // ex:  (.//*[@id='deploymentCardApplicationTitle'][contains(text(),'feb2')]/../../deployment-card)[1]/.//deployment-status-icon
  deploymentStatusIconByNameAndIndex (nameString: string, indexValue: number): ElementFinder {
    let xpathString = '(.//*[@id=\'deploymentCardApplicationTitle\'][contains(text(),\'' + nameString + '\')]/../../deployment-card)[' + indexValue + ']/.//deployment-status-icon';
    return element(by.xpath(xpathString));
  }

  /*  Successful deploy status icon by deployment name and index (stage=1, run=2) */
  // ex: (.//*[@id='deploymentCardApplicationTitle'][contains(text(),'feb2')]/../../deployment-card)[1]/.//deployment-status-icon/span[contains(@title,'Everything is ok.')]
  successfulDeployStatusByNameAndIndex (nameString: string, indexValue: number): ElementFinder {
    let xpathString = '(.//*[@id=\'deploymentCardApplicationTitle\'][contains(text(),\'' + nameString + '\')]/../../deployment-card)[' + indexValue + ']/.//deployment-status-icon/span[contains(@title,\'Everything is ok.\')]';
    return element(by.xpath(xpathString));
  }

  /* Pod running text */
  // ex: (.//*[@id='deploymentCardApplicationTitle'][contains(text(),'feb2')]/../../deployment-card)[1]/.//*[contains(text(),'1 Running')]
  podRunningTextByNameAndIndex(nameString: string, indexValue: number): ElementFinder {
        let xpathString = '(.//*[@id=\'deploymentCardApplicationTitle\'][contains(text(),\'' + nameString + '\')]/../../deployment-card)[' + indexValue + ']/.//*[contains(text(),\'1 Running\')]';
        return element(by.xpath(xpathString));
  }

  /* Resource usage cards */

  /* Resource usage card by index (stage=1,2, run=3,4) */
  resourceUsageCardByIndex (indexValue: number): ElementFinder {
    let xpathString = '(.//*[contains(@class,\'resource-title\')]/../../../..//*[contains (@class,\'card-pf\')])[' + indexValue + ']';
    return element(by.xpath(xpathString));
  }

// TODO: Running icon =    (.//*[contains(@class, 'c3-shape c3-arc c3-arc-Running')])[1]



}
