import { browser, by, ExpectedConditions as until, $, element } from 'protractor';
import { AppPage } from './app.page';

export class UserSettingsPage extends AppPage {

    public async gotoFeaturesTab(): Promise<FeaturesTab> {
        await browser.wait(until.presenceOf(element(by.cssContainingText('a', 'Features Opt-in'))));
        await element(by.cssContainingText('a', 'Features Opt-in')).click();
        return new FeaturesTab();
    }
}

export class FeaturesTab {

    public async getFeatureLevel(): Promise<string> {
        await browser.wait(until.presenceOf(element(by.css('input:checked'))));
        let checkedInput = await element(by.css('input:checked'));
        return await checkedInput.getAttribute('value');
    }
}
