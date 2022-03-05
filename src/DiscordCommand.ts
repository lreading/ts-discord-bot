import { CacheType, CommandInteraction } from 'discord.js';
import {
    SlashCommandBooleanOption,
    SlashCommandIntegerOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
    SlashCommandChannelOption,
    SlashCommandMentionableOption,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder
} from '@discordjs/builders';

import { BotClient } from './BotClient';
import { DiscordLogger } from './Logger';

export interface IDiscordCommand {
    readonly name: string;
    readonly description: string;
    onInteraction(interaction: CommandInteraction): void | Promise<any>;
}

export abstract class BaseDiscordCommand implements IDiscordCommand {
    readonly name: string;
    readonly description: string;
    protected readonly client: BotClient;
    protected readonly logger: DiscordLogger;

    protected readonly integerOptions: SlashCommandIntegerOption[] = [];
    protected readonly stringOptions: SlashCommandStringOption[] = [];
    protected readonly userOptions: SlashCommandUserOption[] = [];
    protected readonly booleanOptions: SlashCommandBooleanOption[] = [];
    protected readonly numberOptions: SlashCommandNumberOption[] = [];
    protected readonly roleOptions: SlashCommandRoleOption[] = [];
    protected readonly channelOptions: SlashCommandChannelOption[] = [];
    protected readonly mentionableOptions: SlashCommandMentionableOption[] = [];

    constructor(name: string, description: string, client: BotClient) {
        this.name = name;
        this.description = description;
        this.client = client;
        this.logger = new DiscordLogger(`Commands/${name}`);
    }

    protected addOptions(builder: SlashCommandBuilder | SlashCommandSubcommandBuilder): void {
        this.integerOptions.forEach((opt) => builder.addIntegerOption(opt));
        this.stringOptions.forEach((opt) => builder.addStringOption(opt));
        this.userOptions.forEach((opt) => builder.addUserOption(opt));
        this.booleanOptions.forEach((opt) => builder.addBooleanOption(opt));
        this.numberOptions.forEach((opt) => builder.addNumberOption(opt));
        this.roleOptions.forEach((opt) => builder.addRoleOption(opt));
    }

    abstract onInteraction(interaction: CommandInteraction<CacheType>): void | Promise<any>;
}
