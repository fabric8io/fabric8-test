import { $ } from 'protractor';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  login = $('#login');

  constructor(url: string) {
    super(url);
  }
}
