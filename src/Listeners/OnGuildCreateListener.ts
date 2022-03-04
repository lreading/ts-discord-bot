import { Guild } from 'discord.js';
import { BaseClientEventListener } from './ClientEventListener';

export class OnGuildCreateListener extends BaseClientEventListener<'guildCreate'> {
    constructor() {
        super('guildCreate');
    }

    public listener = function (guild: Guild) {
        this.logger.info(`Bot added to guild: ${guild.name} / ${guild.id}`);
    }.bind(this);
}
