import { browser } from 'protractor';
import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import * as runner from '../support/script_runner';
import { specContext } from '../support/spec_context';
import { screenshotManager } from '../support/screenshot_manager';
import { PageOpenMode } from '../page_objects/base.page';
import { windowManager } from '../support/window_manager';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { AccountHomeInteractionsFactory } from './account_home_interactions';

export abstract class CheInteractionsFactory {

    public static create(workspace: string): CheInteractions {

        return new CheInteractionsImpl(workspace);
    }
}

export interface CheInteractions {

    openChePage(mode: PageOpenMode): void;

    /**
     * Changes the code in GitHub using Che external tests
     */
    changeCodebase(): void;

    verifyProjects(...projects: string[]): void;

    closeChePage(): void;
}

export class CheInteractionsImpl implements CheInteractions {

    private che: SpaceCheWorkspacePage;

    constructor(private workspace: string) {
        this.che = new SpaceCheWorkspacePage(workspace);
    }

    public async openChePage(mode: PageOpenMode): Promise<void> {
        logger.info('Open Che');
        await this.che.open(mode);
    }

    public async changeCodebase(): Promise<void> {
        logger.info('Change the codebase');
        await this.runCheTests(this.workspace);
        logger.info('Script finished');
    }

    public async verifyProjects(...expectedProjects: string[]): Promise<void> {
        logger.info('Verify projects in Che');
        await browser.wait(
            async () => (await this.che.getProjects()).length === expectedProjects.length,
            timeouts.LONGER_WAIT,
            `Wrong number of projects in Che (expected ${expectedProjects.length}). It could mean that ` +
            `Che workspace failed to start, check che-failed.png and oc-che-logs.txt.`
        );

        let cheProjects = await this.che.getProjects();
        for (let i = 0; i < expectedProjects.length; i++) {
            expect(cheProjects[i]).toBe(expectedProjects[i], 'Project name');
        }
    }

    public async closeChePage(): Promise<void> {
        logger.info('Close Che');
        await screenshotManager.save('che');
        return windowManager.closeCurrentWindow();
    }

    private async runCheTests(workspace: string): Promise<void> {
        let username = specContext.getUser();
        let password = specContext.getPassword();
        let email = await this.getEmail();
        let outputDir = './target/screenshots/che-tests.txt';

        await runner.runScript(
            '.',
            './run-che.sh',
            [username, password, email, workspace],
            outputDir,
            true,
            timeouts.LONGEST_WAIT);
    }

    private async getEmail(): Promise<string> {
        let homeInteractions = AccountHomeInteractionsFactory.create();
        await homeInteractions.openAccountHomePage(PageOpenMode.UseMenu);
        return homeInteractions.getEmail();
    }
}
