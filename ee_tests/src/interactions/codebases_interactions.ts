import * as support from '../support';
import { SpaceChePage } from '../page_objects/space_che.page';
import { browser } from 'protractor';

export abstract class CodebasesInteractionsFactory {

    public static create(): CodebasesInteractions {
        let url: string = browser.params.target.url;
        let isProdPreview = url.includes('prod-preview');

        if (isProdPreview) {
            return new ProdPreviewInteractions();
        }
        return new CodebasesInteractionsImpl();
    }
}

export interface CodebasesInteractions {

    createAndOpenWorkspace(): void;
}

export abstract class AbstractCodebasesInteractions implements CodebasesInteractions {

    public async abstract createAndOpenWorkspace(): Promise<void>;
}

export class CodebasesInteractionsImpl extends AbstractCodebasesInteractions {

    public async createAndOpenWorkspace(): Promise<void> {
        let spaceChePage = new SpaceChePage();
        await spaceChePage.createCodebase.clickWhenReady(support.LONGEST_WAIT);

        await support.windowManager.switchToNewWindow();
    }
}

export class ProdPreviewInteractions extends AbstractCodebasesInteractions {

    public async createAndOpenWorkspace(): Promise<void> {
        let spaceChePage = new SpaceChePage();
        await spaceChePage.createCodebase.clickWhenReady(support.LONGEST_WAIT);

        await spaceChePage.openWorkspace.clickWhenReady(support.LONGEST_WAIT);
        await support.windowManager.switchToNewWindow();
    }
}
