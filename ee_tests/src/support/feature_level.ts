import { browser } from 'protractor';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';

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
        await dashboardPage.open();
        let userSettingsPage = await dashboardPage.gotoUserSettings();
        let featureTab = await userSettingsPage.gotoFeaturesTab();
        let featureLevel = await featureTab.getFeatureLevel();
        return this.getByString(featureLevel);
    }

    public static isReleased(): boolean {
        return this.getConfiguredFeatureLevel() === FeatureLevel.RELEASED;
    }

    public static isBeta(): boolean {
        return this.getConfiguredFeatureLevel() === FeatureLevel.BETA;
    }

    public static isExperimental(): boolean {
        return this.getConfiguredFeatureLevel() === FeatureLevel.EXPERIMENTAL;
    }

    public static isInternal(): boolean {
        return this.getConfiguredFeatureLevel() === FeatureLevel.INTERNAL;
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
