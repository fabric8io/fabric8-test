import * as support from '../support';
import { CodebasesPage } from '../page_objects/space_codebases.page';
import { browser } from 'protractor';
import { SpaceDashboardInteractionsFactory } from './space_dashboard_interactions';
import { PageOpenMode } from '../..';

export abstract class CodebasesInteractionsFactory {

    public static create(strategy: string, spaceName: string): CodebasesInteractions {
        let url: string = browser.params.target.url;
        let isProdPreview = url.includes('prod-preview');

        if (isProdPreview) {
            return new ProdPreviewInteractions(strategy, spaceName);
        }
        return new CodebasesInteractionsImpl(strategy, spaceName);
    }
}

export interface CodebasesInteractions {

    openCodebasesPage(mode: PageOpenMode): void;

    createAndOpenWorkspace(): void;

    getWorkspaces(): Promise<string[]>;
}

abstract class AbstractCodebasesInteractions implements CodebasesInteractions {

    protected strategy: string;

    protected spaceName: string;

    protected page: CodebasesPage;

    constructor(strategy: string, spaceName: string) {
        this.strategy = strategy;
        this.spaceName = spaceName;
        this.page = new CodebasesPage();
    }

    public async abstract createAndOpenWorkspace(): Promise<void>;

    public async openCodebasesPage(mode: PageOpenMode): Promise<void> {
        if (mode === PageOpenMode.UseMenu) {
            let dashboardInteractions = SpaceDashboardInteractionsFactory.create(this.strategy, this.spaceName);
            await dashboardInteractions.openSpaceDashboardPage(mode);
            await dashboardInteractions.openCodebasesPage();
            await this.page.open();
        } else {
            await this.page.open(mode);
        }
    }

    public async getWorkspaces(): Promise<string[]> {
        return this.page.getWorkspaces();
    }
}

class CodebasesInteractionsImpl extends AbstractCodebasesInteractions {

    public async createAndOpenWorkspace(): Promise<void> {
        await this.page.createWorkspace();
        await this.page.openWorkspace();
        await support.windowManager.switchToNewWindow();
    }
}

class ProdPreviewInteractions extends CodebasesInteractionsImpl {
}
