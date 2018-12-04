import { browser } from 'protractor';
import { ReleaseStrategy } from './release_strategy';
import { Quickstart } from './quickstart';
import * as logger from './logging';

class SpecContext {

    getUser(): string {
        return browser.params.login.user;
    }

    getPassword(): string {
        return browser.params.login.password;
    }

    getOsioUrl(): string {
        let osioURL: string = browser.params.target.url.replace('https://', '');
        return osioURL;
    }

    getJenkinsUrl(): string {
        return 'https://jenkins.' + this.getOsioUrl();
    }

    getCheUrl(): string {
        return 'https://che.' + this.getOsioUrl() + '/' + this.getUser();
    }

    isLocalhost(): boolean {
        return this.getOsioUrl().includes('localhost');
    }

    isProdPreview(): boolean {
        return this.getOsioUrl().includes('prod-preview');
    }

    isProduction(): boolean {
        return !this.isLocalhost() && !this.isProdPreview();
    }

    getReleaseStrategy(): ReleaseStrategy {
        let strategy = browser.params.release.strategy;

        if (strategy === ReleaseStrategy.RELEASE) {
            return ReleaseStrategy.RELEASE;
        }

        if (strategy === ReleaseStrategy.STAGE) {
            return ReleaseStrategy.STAGE;
        }

        if (strategy === ReleaseStrategy.RUN) {
            return ReleaseStrategy.RUN;
        }

        throw 'Unsupported release strategy: "' + strategy + '"';
    }

    getQuickstart(): Quickstart {
        return new Quickstart(browser.params.quickstart.name);
    }

    isEnvironmentResetEnabled(): boolean {
        if (browser.params.reset.environment === 'true') {
            return true;
        } else {
            return false;
        }
    }

    getGitHubUser(): string {
        return browser.params.github.username;
    }

    getGitHubRepo(): string {
        return browser.params.github.repo;
    }

    print(): void {
        logger.info('User: ' + this.getUser());
        logger.info('Password: ' + this.getPassword().replace(/./g, '*'));
        logger.info('URL: ' + this.getOsioUrl());
        logger.info('Release strategy: ' + this.getReleaseStrategy());
        logger.info('Quickstart: ' + this.getQuickstart().name);
        logger.info('GitHub user: ' + this.getGitHubUser());
        logger.info('Environment reset enabled: ' + this.isEnvironmentResetEnabled());
    }
}

export let specContext = new SpecContext();
