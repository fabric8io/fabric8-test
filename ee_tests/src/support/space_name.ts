import * as logger from '../support/logging';

export function newSpaceName(): string {
    return SpaceName.newSpaceName();
}

class SpaceName {

    static spaceName: string;

    static newSpaceName(): string {
        const d = new Date();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const hour = d.getHours().toString().padStart(2, '0');
        const minute = d.getMinutes().toString().padStart(2, '0');
        const randomNumber = Math.round(Math.random() * 10000);
        const spaceName = `e2e-${month}${day}-${hour}${minute}-${randomNumber}`;

        logger.info('New space name: ', spaceName);
        SpaceName.spaceName = spaceName;
        return SpaceName.spaceName;

    }
}
