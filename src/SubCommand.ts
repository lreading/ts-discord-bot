import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { BotClient } from './BotClient';
import { BaseDiscordCommand, IDiscordCommand } from './DiscordCommand';

export interface ISubCommand extends IDiscordCommand {
    build(): SlashCommandSubcommandBuilder;
}

export abstract class BaseSubCommand extends BaseDiscordCommand implements ISubCommand {
    constructor(name: string, description: string, client: BotClient) {
        super(name, description, client);
    }

    build(): SlashCommandSubcommandBuilder {
        const builder = new SlashCommandSubcommandBuilder()
            .setName(this.name)
            .setDescription(this.description);

        this.addOptions(builder);
        
        return builder;
    }
}