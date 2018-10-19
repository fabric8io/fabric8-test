import { browser } from 'protractor';
import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import * as runner from  '../support/script_runner';
import { specContext } from '../support/spec_context';
import { AccountHomeInteractionsFactory } from './account_home_interactions';
import { PageOpenMode } from '../page_objects/base.page';

export abstract class CheInteractionsFactory {

    public static create(): CheInteractions {

        return new CheInteractionsImpl();
    }
}

export interface CheInteractions {

    changeCodebase(workspace: string): void;
}

export abstract class AbstractCheInteractions implements CheInteractions {

    public async abstract changeCodebase(workspace: string): Promise<void>;
}

export class CheInteractionsImpl extends AbstractCheInteractions {

    public async changeCodebase(workspace: string): Promise<void> {
        await this.runCheTests(workspace);
        logger.info('Script finished');
    }

    private async runCheTests(workspace: string): Promise<void> {
        let location = browser.params.che.local.repo;
        let script = './cico/run_EE_suite.sh';
        let osio = specContext.getOsioUrl();
        let username = specContext.getUser();
        let password = specContext.getPassword();
        let outputDir = './target/screenshots/che-tests.txt';
        // tslint:disable-next-line:max-line-length
        let token = await this.getToken();

        await runner.runScript(
            location,
            script,
            [osio, username, password, workspace, token],
            outputDir,
            true,
            timeouts.LONGEST_WAIT);
    }

    private async getToken(): Promise<string> {
        let accountHomeInteractions = AccountHomeInteractionsFactory.create();
        await accountHomeInteractions.openAccountHomePage(PageOpenMode.UseMenu);
        return accountHomeInteractions.getToken();
    }
}
