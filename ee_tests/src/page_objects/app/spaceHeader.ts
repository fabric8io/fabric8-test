import { debug } from '../../support';
import { BaseElement } from '../../ui/base.element';

export class SpaceHeader extends BaseElement {

  async ready() {
    debug(' ... check if Space Header is ready');
    debug(' ... check if Space Header is ready - OK');
  }

  async selectAnalyze() {
    throw 'Not yet implemented';
  }

  async selectCreate() {
    throw 'Not yet implemented';
  }

  async selectPlan() {
    throw 'Not yet implemented';
  }
}
