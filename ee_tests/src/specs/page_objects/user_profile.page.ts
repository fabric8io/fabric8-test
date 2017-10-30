import { browser, ExpectedConditions as until, $ } from 'protractor';
import * as support from '../support';

import { AppPage } from './app.page';

import { Button } from './ui';

export class UserProfilePage extends AppPage {
  updateProfileButton = new Button($(' alm-overview > div > div > button'));

  async ready() {
    await super.ready();
    await this.updateProfileButton.untilClickable();
  }
}

