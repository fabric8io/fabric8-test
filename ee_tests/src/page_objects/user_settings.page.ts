import { browser, by, element, ExpectedConditions as until } from 'protractor';
import { AppPage } from './app.page';

export class UserSettingsPage extends AppPage {

  public async gotoFeaturesTab(): Promise<FeaturesTab> {
        await browser.wait(until.presenceOf(element(by.cssContainingText('a', 'Features Opt-in'))));
        await element(by.cssContainingText('a', 'Features Opt-in')).click();
        return new FeaturesTab();
  }
}

export class FeaturesTab {
    readonly featureInputXpath = '//input/ancestor::*[contains(@class, \'active\')]//span[contains(@class,\'icon-\')]';
    public async getFeatureLevel(): Promise<string> {
        await browser.wait(until.presenceOf(element(by.xpath(this.featureInputXpath))));
        let checkedInput = await element(by.xpath(this.featureInputXpath));
        let featureInputIconCss = await checkedInput.getAttribute('class');
        let featureCss = featureInputIconCss.match('icon-(internal|experimental|beta|released)');
        await expect(featureCss).not.toBeNull('feature css');
        if (featureCss != null) {
            return featureCss[1];
        }
        return 'null';
    }
}
