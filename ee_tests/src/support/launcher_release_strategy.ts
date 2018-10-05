import { browser } from 'protractor';

export class LauncherReleaseStrategy {

  static RELEASE = 'release';
  static RELEASE_AND_STAGE = 'releaseAndStage';
  static RELEASE_STAGE_APPROVE_AND_PROMOTE = 'releaseStageApproveAndPromote';

  id: string;
  name: string;

  constructor(runtime: string) {
    this.id = runtime;

    switch (runtime) {
      case LauncherReleaseStrategy.RELEASE: {
        let url: string = browser.params.target.url;
        let isProdPreview = url.includes('prod-preview');

        if (isProdPreview === true) {
          this.name = 'Build Image';
        } else {
          this.name = 'Build Release';
        }
        break;
      }
      case LauncherReleaseStrategy.RELEASE_AND_STAGE: {
        this.name = 'Rollout to Stage';
        break;
      }
      case LauncherReleaseStrategy.RELEASE_STAGE_APPROVE_AND_PROMOTE:
      default: {
        this.name = 'Rollout to Run';
        break;
      }
    }
  }

  static runtime(id: string) {
    return new LauncherReleaseStrategy(id);
  }
}
