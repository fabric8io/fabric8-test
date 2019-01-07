import { browser, by, element, ExpectedConditions as until } from 'protractor';
import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import * as runner from '../support/script_runner';
import { windowManager } from '../support/window_manager';
import { screenshotManager } from '../support/screenshot_manager';
import { Environment } from '../support/environments';
import { specContext } from '../support/spec_context';

export abstract class DeployedApplicationInteractionsFactory {

    public static create(e: Environment): DeployedApplicationInteractions {
        if (e === Environment.RUN) {
            return new RunDeployedApplicationInteractions();
        } else {
            return new StageDeployedApplicationInteractions();
        }
    }
}

export interface DeployedApplicationInteractions {

    verifyDeployedApplication(testCallback: () => void): void;
}

abstract class AbstractDeployedApplicationInteractions implements DeployedApplicationInteractions {

    constructor(private environment: string) {
    }

    async verifyDeployedApplication(testCallback: () => void): Promise<void> {
        logger.info('Verify application on ' + this.environment + ' environment');
        let error: any;
        try {
            await windowManager.switchToNewWindow();

            await browser.wait(
                until.urlContains(this.environment),
                timeouts.DEFAULT_WAIT,
                `url contains ${this.environment}`);

            await browser.wait(async () => {
                await browser.refresh();
                return ! await element(by.cssContainingText('h1', 'Application is not available')).isPresent();
            }, timeouts.LONGER_WAIT, 'Application takes more than 10 minutes to start');

            let currentURL = await browser.getCurrentUrl();
            expect(currentURL).toContain(this.environment, `${this.environment} environment url`);

            await testCallback();
        } catch (e) {
            error = e;
        } finally {
            await screenshotManager.save(this.environment);
            await this.runOCScript();
            await windowManager.closeAllWindows();
        }

        if (error !== undefined) {
            throw error;
        }
    }

    private async runOCScript() {
        try {
          logger.info(`Save OC ${this.environment} pod log`);
          await runner.runScript(
            '.', // working directory
            './oc-get-project-logs.sh', // script
            [specContext.getUser(), specContext.getPassword(), this.environment], // params
            `./target/screenshots/oc-${this.environment}.txt`,  // output file
            false,
            timeouts.LONGER_WAIT
          );
        } catch (e) {
          logger.info('Save OC Jenkins pod log failed with error: ' + e);
        }
      }
}

class StageDeployedApplicationInteractions extends AbstractDeployedApplicationInteractions {

    constructor() {
        super('stage');
    }
}

class RunDeployedApplicationInteractions extends AbstractDeployedApplicationInteractions {

    constructor() {
        super('run');
    }
}
