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
