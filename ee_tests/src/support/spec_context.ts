import { browser } from 'protractor';

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

    isLocalhost(): boolean {
        return this.getOsioUrl().includes('localhost');
    }

    isProdPreview(): boolean {
        return this.getOsioUrl().includes('prod-preview');
    }

    isProduction(): boolean {
        return !this.isLocalhost() && !this.isProdPreview();
    }
}

export let specContext = new SpecContext();
