import * as logger from '../support/logging';
import { windowManager } from '../support/window_manager';
import { CodebasesPage } from '../page_objects/space_codebases.page';
import { SpaceDashboardInteractionsFactory } from './space_dashboard_interactions';
import { PageOpenMode } from '../page_objects/base.page';
import { browser } from 'protractor';

export abstract class CodebasesInteractionsFactory {

    public static create(strategy: string, spaceName: string): CodebasesInteractions {
        return new CodebasesInteractionsImpl(strategy, spaceName);
    }
}

export interface CodebasesInteractions {

    openCodebasesPage(mode: PageOpenMode): void;

    createWorkspace(): Promise<string>;

    createAndOpenWorkspace(): Promise<string>;

    getWorkspaces(): Promise<string[]>;

    getSelectedWorkspace(): Promise<string>;
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

    public async abstract createWorkspace(): Promise<string>;

    public async abstract createAndOpenWorkspace(): Promise<string>;

    public async openCodebasesPage(mode: PageOpenMode): Promise<void> {
        logger.info('Open codebases page');
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

    public async getSelectedWorkspace(): Promise<string> {
        return this.page.getSelectedWorkspace();
    }
}

class CodebasesInteractionsImpl extends AbstractCodebasesInteractions {

    public async createWorkspace(): Promise<string> {
        logger.info('Create and open workspace');
        try {
            logger.debug('Create workspace');
            await this.page.createWorkspace();
            logger.debug('Create workspace was successfull');
        } catch (e) {
            logger.debug('Create workspace failed, trying again after refresh');
            await browser.refresh();
            await this.page.createWorkspace();
            logger.debug('Create workspace was successfull');
        }
        return this.page.getSelectedWorkspace();
    }

    public async createAndOpenWorkspace(): Promise<string> {
        let workspace = await this.createWorkspace();
        await this.page.openWorkspace();
        await windowManager.switchToNewWindow();
        return Promise.resolve(workspace);
    }
}
