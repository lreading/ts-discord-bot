import {
    BitFieldResolvable,
    Client,
    ClientEvents,
    CommandInteraction,
    Intents,
    IntentsString
} from 'discord.js';


import {
    BaseClientEventListener,
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
    private readonly listeners: BaseClientEventListener<keyof ClientEvents>[] = [];
    private readonly commands: Map<string, ICommand> = new Map();
    
    private static readonly defaultIntents: BitFieldResolvable<IntentsString, number>[] = [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES
    ];
    private static readonly defaultListeners: BaseClientEventListener<keyof ClientEvents>[] = [
        new OnErrorListener(),
        new OnReadyListener(),
        new OnGuildCreateListener(),
        new OnGuildDeleteListener()
    ];

    constructor(
        listeners: BaseClientEventListener<keyof ClientEvents>[] = BotClient.defaultListeners,
        intents: BitFieldResolvable<IntentsString, number>[] = BotClient.defaultIntents    
    ) {
        this.logger = new DiscordLogger('BotClient.ts');
        listeners.forEach((listener) => this.listeners.push(listener), this);
        this.client = new Client({ intents });
    }

    private addListeners(): void {
        this.listeners.forEach(listener => this.client.on(listener.name, listener.listener), this);
    }

    private async onInteractionCreate(interaction: CommandInteraction) {
        await this.commands.get(interaction.command.name).onInteraction(interaction);
    }

    public async start(): Promise<void> {
        this.logger.info('Starting Discord SlashCommand Bot');
        this.logger.silly('Adding listeners');
        this.addListeners();
        this.client.on('interactionCreate', this.onInteractionCreate.bind(this));
        this.logger.debug('Attempting login');
        await this.client.login(env.token);
    }

    public async addCommand(command: ICommand): Promise<any> {
        this.logger.info(`Adding command ${command.name}`);
        const cmd = await this.client.application.commands.create(command.build().toJSON());
        this.logger.debug(`Command added as ${cmd.name}`);

        this.logger.info('Fetching guilds...');
        const guilds = await this.client.guilds.fetch();
        this.logger.debug(guilds);
        guilds.forEach(async (guild) => {
            const permissions = await command.getPermissions(await guild.fetch(), this.client);
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
}
