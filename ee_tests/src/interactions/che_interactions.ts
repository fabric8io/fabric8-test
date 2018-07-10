import { browser } from 'protractor';
import * as support from '../support';
import * as runner from  '../support/script_runner';
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
        support.info('Script finished');
    }

    private async runCheTests(workspace: string): Promise<void> {
        let location = browser.params.che.local.repo;
        let script = './cico/run_EE_suite.sh';
        let osio: string =  browser.params.target.url;
        osio = osio.replace('https://', '');
        let username = browser.params.login.user;
        let password = browser.params.login.password;
        let outputDir = './target/screenshots/che-tests.txt';
        // tslint:disable-next-line:max-line-length
        let token = await this.getToken();

        await runner.runScript(
            location,
            script,
            [osio, username, password, workspace, token],
            outputDir,
            support.LONGEST_WAIT);
    }

    private async getToken(): Promise<string> {
        let accountHomeInteractions = AccountHomeInteractionsFactory.create();
        await accountHomeInteractions.openAccountHomePage(PageOpenMode.UseMenu);
        return accountHomeInteractions.getToken();
    }
}
