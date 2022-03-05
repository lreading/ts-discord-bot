import {
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandUserOption
} from "@discordjs/builders";

import {
    ApplicationCommandPermissionData,
    CacheType,
    CommandInteraction,
    Guild
} from "discord.js";

import { BotClient } from "./BotClient";
import { DiscordLogger } from "./Logger";

export interface ICommand {
    readonly name: string;
    readonly description: string;

    build(): SlashCommandBuilder;
    onInteraction(interaction: CommandInteraction): void | Promise<any>;
    getPermissions(guild: Guild): ApplicationCommandPermissionData[] | Promise<ApplicationCommandPermissionData[]>;
}

export abstract class BaseCommand implements ICommand {
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

    constructor(name: string, description: string, client: BotClient) {
        this.name = name;
        this.description = description;
        this.client = client;
        this.logger = new DiscordLogger(`Commands/${name}`);
    }
    
    abstract onInteraction(interaction: CommandInteraction<CacheType>): void | Promise<any>;

    build(): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        
        this.integerOptions.forEach((opt) => builder.addIntegerOption(opt));
        this.stringOptions.forEach((opt) => builder.addStringOption(opt));
        this.userOptions.forEach((opt) => builder.addUserOption(opt));
        this.booleanOptions.forEach((opt) => builder.addBooleanOption(opt));
        this.numberOptions.forEach((opt) => builder.addNumberOption(opt));
        this.roleOptions.forEach((opt) => builder.addRoleOption(opt));

        return builder;
    }

    //  eslint-disable-next-line @typescript-eslint/no-unused-vars
    getPermissions(guild: Guild): ApplicationCommandPermissionData[] | Promise<ApplicationCommandPermissionData[]> {
        return [];
    }
}
