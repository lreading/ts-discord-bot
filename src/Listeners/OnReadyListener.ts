import { Client } from 'discord.js';
import { BaseClientEventListener } from './ClientEventListener';

export class OnReadyListener extends BaseClientEventListener<'ready'> {
    constructor() {
        super('ready');
    }

    public listener = function (client: Client) {
        this.logger.info(`Logged in as ${client.user.tag}`);
    }.bind(this);
}
