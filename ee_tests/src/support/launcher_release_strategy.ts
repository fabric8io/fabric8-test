import { ReleaseStrategy } from "./release_strategy";

export class LauncherReleaseStrategy {

  id: ReleaseStrategy;
  name: string;

  constructor(strategy: ReleaseStrategy) {
    this.id = strategy;

    switch (this.id) {
      case ReleaseStrategy.RELEASE: {
        this.name = 'Integration Test';
        break;
      }
      case ReleaseStrategy.STAGE: {
        this.name = 'Rollout to Stage';
        break;
      }
      case ReleaseStrategy.RUN:
      default: {
        this.name = 'Rollout to Run';
        break;
      }
    }
  }
}
