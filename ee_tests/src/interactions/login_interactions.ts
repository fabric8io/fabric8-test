import { browser, by, element } from 'protractor';
import { LandingPage } from '../page_objects/landing.page';
import { PageOpenMode } from '../page_objects/base.page';
import { Button } from '../ui';
import { AccountHomeInteractionsFactory } from './account_home_interactions';
import { LoginPage } from '../page_objects/login.page';

export abstract class LoginInteractionsFactory {

  public static create(): LoginInteractions {

    let url: string = browser.params.target.url;
    if (url.includes('localhost')) {
      return new LocalLoginInteractions();
    }

    return new LoginInteractionsImpl();
  }
}

export interface LoginInteractions {

  login(): void;

  isLoginButtonPresent(): Promise<boolean>;
}

export class LoginInteractionsImpl implements LoginInteractions {

  async login(): Promise<void> {
    let username = browser.params.login.user;
    let password = browser.params.login.password;

    let page = new LandingPage();
    await page.open();

    let loginPage = await page.gotoLoginPage();
    await loginPage.login(username, password);

    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.openAccountHomePage(PageOpenMode.AlreadyOpened);
  }

  async isLoginButtonPresent(): Promise<boolean> {
    return new LandingPage().loginButton.isPresent();
  }
}

export class LocalLoginInteractions implements LoginInteractions {

  async login(): Promise<void> {
    await browser.get(browser.params.target.url);
    let username = browser.params.login.user;
    let password = browser.params.login.password;

    await new Button(element(by.cssContainingText('button', 'Log In')), 'Log In').clickWhenReady();
    await new LoginPage().login(username, password);

    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.openAccountHomePage(PageOpenMode.AlreadyOpened);
  }

  async isLoginButtonPresent(): Promise<boolean> {
    return new Button(element(by.cssContainingText('button', 'Log In')), 'Log In').isPresent();
  }
}
