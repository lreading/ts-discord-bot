import {
    ApplicationCommand,
    BitFieldResolvable,
    Client,
    ClientEvents,
    CommandInteraction,
    GuildResolvable,
    Intents,
    IntentsString
} from 'discord.js';


import {
    IClientEventListener,
    OnErrorListener,
    OnGuildCreateListener,
    OnGuildDeleteListener,
    OnReadyListener
} from './Listeners';
import { DiscordLogger, IDiscordLogger } from './Logger';
import { env } from './Env';
import { ICommand } from './Command';

export class BotClient {
    private readonly logger: IDiscordLogger;
    private readonly client: Client;
    private readonly listeners: Map<keyof ClientEvents, IClientEventListener<keyof ClientEvents>> = new Map();
    private readonly commands: Map<string, ICommand> = new Map();
    private readonly appCommands: Map<string, ApplicationCommand<{ guild: GuildResolvable }>> = new Map();
    
    private static readonly defaultIntents: BitFieldResolvable<IntentsString, number>[] = [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES
    ];
    private static readonly defaultListeners: IClientEventListener<keyof ClientEvents>[] = [
        new OnErrorListener(),
        new OnReadyListener(),
        new OnGuildCreateListener(),
        new OnGuildDeleteListener()
    ];

    constructor(
        intents: BitFieldResolvable<IntentsString, number>[] = BotClient.defaultIntents    
    ) {
        this.logger = new DiscordLogger('BotClient.ts');
        this.client = new Client({ intents });
        BotClient.defaultListeners.forEach((listener) => this.setListener(listener), this);
    }

    private async onInteractionCreate(interaction: CommandInteraction) {
        const command = this.commands.get(interaction.commandName);
        if (!command) {
            this.logger.warn(`Received interaction without a command: ${interaction.commandName}`);
            await interaction.reply({
                content: 'Whoops! I didn\'t handle that well. Either try again later, or tell the human that maintains me!',
                ephemeral: true
            });
            return;
        }
        await this.commands.get(interaction.command.name).onInteraction(interaction);
    }

    private attachListeners(): void {
        this.listeners.forEach((listener) => {
            if (listener) this.client.on(listener.name, listener.listener);
        }, this);
    }

    public async start(): Promise<void> {
        this.logger.info('Starting Discord SlashCommand Bot');
        this.logger.silly('Adding listeners');
        this.attachListeners();
        this.client.on('interactionCreate', this.onInteractionCreate.bind(this));
        this.logger.debug('Attempting login');
        await this.client.login(env.token);
    }

    public async addCommand(command: ICommand): Promise<any> {
        this.logger.info(`Adding command ${command.name}`);
        const cmd = await this.client.application.commands.create(command.build().toJSON());
        this.appCommands.set(cmd.name, cmd);
        this.logger.debug(`Command added as ${cmd.name}`);

        this.logger.debug('Fetching guilds...');
        const guilds = await this.client.guilds.fetch();
        this.logger.debug(guilds);
        guilds.forEach(async (guild) => {
            const permissions = await command.getPermissions(await guild.fetch());
            if (permissions.length !== 0) {
                this.logger.debug(`Assigning permissions for ${command.name} in ${guild.name}`);
                await cmd.permissions.add({
                    guild: guild.id,
                    permissions
                });
                await cmd.setDefaultPermission(false);
            }
        });
        this.commands.set(cmd.name, command);
        this.logger.info(`Done adding command ${command.name}!`);
    }

    public async addCommands(commands: ICommand[]): Promise<any> {
        commands.forEach(async (command) => this.addCommand(command), this);
    }

    public setListener(listener: IClientEventListener<keyof ClientEvents>): void {
        this.listeners.set(listener.name, listener);
    }

    public getCommand(name: string): ApplicationCommand<{ guild: GuildResolvable}> {
        return this.appCommands.get(name) || null;
    }
}
