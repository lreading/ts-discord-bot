import { BaseClientEventListener } from './ClientEventListener'

export class OnErrorListener extends BaseClientEventListener<'error'> {
    constructor() {
        super('error');
    }

    public listener = function (error: Error) {
        this.logger.error(error);
    }.bind(this);
}
