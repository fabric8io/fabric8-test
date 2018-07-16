import * as support from '../support';
import { CodebasesPage } from '../page_objects/space_codebases.page';
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

    getWorkspaces(): Promise<string[]>;
}

export abstract class AbstractCodebasesInteractions implements CodebasesInteractions {

    protected page: CodebasesPage;

    constructor() {
        this.page = new CodebasesPage();
    }

    public async abstract createAndOpenWorkspace(): Promise<void>;

    public async getWorkspaces(): Promise<string[]> {
        return this.page.getWorkspaces();
    }
}

export class CodebasesInteractionsImpl extends AbstractCodebasesInteractions {

    public async createAndOpenWorkspace(): Promise<void> {
        await this.page.createWorkspace();
        await support.windowManager.switchToNewWindow();
    }
}

export class ProdPreviewInteractions extends AbstractCodebasesInteractions {

    public async createAndOpenWorkspace(): Promise<void> {
        await this.page.createWorkspace();
        await this.page.openWorkspace();
        await support.windowManager.switchToNewWindow();
    }
}
