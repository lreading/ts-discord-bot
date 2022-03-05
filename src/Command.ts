import { SlashCommandBuilder } from "@discordjs/builders";

import {
    ApplicationCommandPermissionData,
    CacheType,
    CommandInteraction,
    Guild
} from "discord.js";

import { BotClient } from './BotClient';
import { BaseDiscordCommand, IDiscordCommand } from './DiscordCommand';
import { ISubCommand } from "./SubCommand";

export interface ICommand extends IDiscordCommand {
    build(): SlashCommandBuilder;
    getPermissions(guild: Guild): ApplicationCommandPermissionData[] | Promise<ApplicationCommandPermissionData[]>;
}

export abstract class BaseCommand extends BaseDiscordCommand implements ICommand {
    protected readonly subCommands: ISubCommand[] = [];
    private readonly subCommandMap: Map<string, ISubCommand> = new Map();

    constructor(name: string, description: string, client: BotClient) {
        super(name, description, client);
    }
    
    abstract onInteraction(interaction: CommandInteraction<CacheType>): void | Promise<any>;

    build(): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        
        this.addOptions(builder);
        this.subCommands.forEach((cmd) => {
            builder.addSubcommand(cmd.build());
            this.subCommandMap.set(cmd.name, cmd);
        }, this);

        return builder;
    }

    deferToSubCommand(interaction: CommandInteraction<CacheType>): void | Promise<any> {
        return this.subCommandMap.get(interaction.options.getSubcommand()).onInteraction(interaction);
    }

    //  eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPermissions(guild: Guild): ApplicationCommandPermissionData[] | Promise<ApplicationCommandPermissionData[]> {
        return [];
    }
}
