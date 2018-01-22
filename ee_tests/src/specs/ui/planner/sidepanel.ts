import { $, ElementFinder } from 'protractor';
import  *  as ui from './../../ui';
import * as support from '../../support';

export class SidePanel extends ui.BaseElement {
  showHideSidePanelButton = new ui.Button(this.$('.f8-sidepanel--toggle'), 'show/hide side panel button');
  allButton = new ui.Button(this.$('.f8-sidepanel__title'), 'Side panel All Button');
  portfolioButton = new ui.Button(this.$('#portfolio'), 'Side panel Portfolio Button');
  requirementsButton = new ui.Button(this.$('#requirements'), 'Side panel Requirements Button');
  createIterationButton = new ui.Button(this.$('#add-iteration-icon'), 'Side panel Add Iteration Button');

  // TODO - Add iterations section

  constructor(ele: ElementFinder, name: string = 'WorkItem List page Side Panel') {
    super(ele, name);
  }

  async ready() {
    support.debug('... check if Side panel is Ready');
    await super.ready();
    await this.showHideSidePanelButton.ready();
    await this.allButton.ready();
    await this.portfolioButton.ready();
    await this.requirementsButton.ready();
    await this.createIterationButton.ready();
    support.debug('... check if Side panel is Ready - OK');
  }

  async createNewIteration() {
    // TODO
  }
}
