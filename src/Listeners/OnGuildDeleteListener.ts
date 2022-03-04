import { Guild } from 'discord.js';
import { BaseClientEventListener } from './ClientEventListener';

export class OnGuildDeleteListener extends BaseClientEventListener<'guildDelete'> {
    constructor() {
        super('guildDelete');
    }

    public listener = function (guild: Guild) {
        this.logger.info(`Bot removed from guild: ${guild.name} / ${guild.id}`);
    }.bind(this);
}
