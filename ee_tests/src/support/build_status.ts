export enum BuildStatus {
    NEW = 'New',
    RUNNING = 'Running',
    PENDING = 'Pending',
    COMPLETE = 'Complete',
    CANCELLED = 'Cancelled',
    ERROR = 'Error',
    FAILED = 'Failed'
}

export class BuildStatusUtils {

    public static buildEnded(status: string): boolean {
        return  status === BuildStatus.COMPLETE ||
                status === BuildStatus.FAILED ||
                status === BuildStatus.CANCELLED ||
                status === BuildStatus.ERROR;
    }
}

export enum BuildStageStatus {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    PAUSED_PENDING_INPUT = 'PAUSED_PENDING_INPUT',
    ABORTED = 'ABORTED',
    IN_PROGRESS = 'IN_PROGRESS'
}

export class BuildStageStatusUtils {

    public static buildEnded(status: string): boolean {
        return  status === BuildStageStatus.SUCCESS ||
                status === BuildStageStatus.FAILED ||
                status === BuildStageStatus.ABORTED;
    }
}
