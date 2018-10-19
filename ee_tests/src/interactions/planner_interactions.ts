import { browser } from 'protractor';
import { FeatureLevelUtils } from '../support/feature_level';
import { PageOpenMode } from '../page_objects/base.page';
import * as logger from '../support/logging';
import { specContext } from '../support/spec_context';
import { PlannerPage } from 'planner-functional-test';
import { SpaceDashboardInteractionsFactory } from './space_dashboard_interactions';
import { WorkItem } from 'planner-functional-test/dist/ui/planner';

export abstract class PlannerInteractionsFactory {

    public static create(strategy: string, spaceName: string): PlannerInteractions {

        if (specContext.isProduction() || FeatureLevelUtils.isReleased()) {
            return <PlannerInteractions>{
                openPlannerPage(): void { },
                createAndAssignWorkItem(workItem: WorkItem, asignee: string): void { }
            };
        }

        return new PlannerInteractionsImpl(strategy, spaceName);
    }
}

export interface PlannerInteractions {

    openPlannerPage(): void;

    createAndAssignWorkItem(workItem: WorkItem, asignee: string): void;
}

class PlannerInteractionsImpl implements PlannerInteractions {

    private page: PlannerPage;

    constructor(private strategy: string, private spaceName: string) {
        this.page = new PlannerPage(browser.baseUrl);
    }

    async openPlannerPage(): Promise<void> {
        logger.info('Open planner');
        let dashboardInteractions = SpaceDashboardInteractionsFactory.create(this.strategy, this.spaceName);
        await dashboardInteractions.openSpaceDashboardPage(PageOpenMode.UseMenu);
        await dashboardInteractions.openPlannerPage();
        await this.page.open();
    }

    async createAndAssignWorkItem(workItem: WorkItem, asignee: string): Promise<void> {
        await this.page.createWorkItem(workItem);
        expect(this.page.workItemList.hasWorkItem(workItem.title)).toBeTruthy();

        await this.page.workItemList.clickWorkItem(workItem.title);
        await this.page.quickPreview.titleInput.untilTextIsPresentInValue(workItem.title);
        await this.page.quickPreview.addAssignee(asignee);
        expect(this.page.quickPreview.getAssignees()).toContain(asignee);

        await this.page.quickPreview.close();
    }
}
