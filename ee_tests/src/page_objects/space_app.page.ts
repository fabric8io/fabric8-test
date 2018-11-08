import { AppPage } from './app.page';
import { SpaceHeader } from './app/space_header';

export abstract class SpaceAppPage extends AppPage {

  spaceHeader = new SpaceHeader(this.appTag.$('header > alm-app-header > nav'));

}
