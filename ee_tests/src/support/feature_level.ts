import { browser, element, by } from 'protractor';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import * as support from '../support';

export enum FeatureLevel {
    RELEASED = 'released',
    BETA = 'beta',
    EXPERIMENTAL = 'experimental',
    INTERNAL = 'internal'
}

export class FeatureLevelUtils {

    public static getConfiguredFeatureLevel(): FeatureLevel {
        let level = browser.params.feature.level;
        return this.getByString(level);
    }

    public static async getRealFeatureLevel(): Promise<FeatureLevel> {
      let dashboardPage = new MainDashboardPage();
      let userProfilePage = await dashboardPage.gotoUserProfile();
      let editProfilePage = await userProfilePage.gotoEditProfile();

      let form = await element(by.cssContainingText('form', 'Features Opt-in'));
      let checkedInput = await form.element(by.css('input:checked'));
      let checkedValue = await checkedInput.getAttribute('value');
      return this.getByString(checkedValue);
    }

    private static getByString(level: string): FeatureLevel {
        if (level === 'no_pre_production' || level === FeatureLevel.RELEASED) {
            return FeatureLevel.RELEASED;
        }
        if (level === FeatureLevel.BETA) {
            return FeatureLevel.BETA;
        }
        if (level === FeatureLevel.EXPERIMENTAL) {
            return FeatureLevel.EXPERIMENTAL;
        }
        if (level === FeatureLevel.INTERNAL) {
            return FeatureLevel.INTERNAL;
        }
        throw 'Unknown feature level "' + level + '"';
    }
}
