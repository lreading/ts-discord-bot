# Typescript Discord Bot
This library is an abstraction built on top of the [discord.js](https://github.com/discordjs/discord.js/) library.  It's meant to be used as a quick-start for new bots.

## Installation
Install this package, alongside `discord.js`:
`npm i -S @nerdyhick/ts-discord-bot discord.js`

Familiarize yourself with how the Discord Bots work.  Discord.js has a [great guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html) on creating your bot in the Discord developer portal.

## Quickstart
```ts
import {
    CacheType,
    CommandInteraction,
 } from 'discord.js';

import { BaseCommand, BotClient } from '../src';

/*
    Please do not hard-code your credentials, it is a security risk.
    This is only for example purposes.  
    OWASP provides a helpful cheatsheet for secret management:
        https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_CheatSheet.html
*/
process.env['DISCORD_APPLICATION_ID'] = 'myawesomeappid';
process.env['DISCORD_TOKEN'] = 'mysecrettoken'

class PingCommand extends BaseCommand {
    constructor() {
        super('ping', 'replies with pong!');
    }

    async onInteraction(interaction: CommandInteraction<CacheType>): Promise<any> {
        return await interaction.reply('Pong!');
    }
}

(async () => {
    const commands = [
        new PingCommand()
    ];

    const client = new BotClient();
    await client.start();
    await client.addCommands(commands);
})();
```

# BotClient

The BotClient class is responsible for creating the client and commands.  You can specify [Discord Intents](https://discord.js.org/#/docs/main/stable/class/Intents?scrollTo=s-FLAGS) and [Client Event](https://discord.js.org/#/docs/main/stable/class/Client) listeners in the constructor.
If none are specified, the defaults are used.

Default Intents:
    - Intents.FLAGS.GUILDS,
    - Intents.FLAGS.GUILD_MEMBERS,
    - Intents.FLAGS.GUILD_MESSAGES

Default Client Event Listeners:
    - Error: Logs a message when there is an error in the client
    - Ready: Logs a message when the client is ready
    - GuildCreate: Logs a message when the bot joins a guild
    - GuildDelete: Logs a message when the bot is removed or kicked from a build
    - InteractionCeate: Delegates to the named command, see the commands section for creating commands

## Secrets

The BotClient needs to know your discord application id and bot token.  These values can be found on your Developer/Application page on Discord.  The secrets are read from `process.env['DISCORD_APPLICATION_ID']` and `process.env['DISCORD_TOKEN']`.  Please keep your token a secret.  I recommend using [dotenv](https://github.com/motdotla/dotenv) or similar.  If you are running inside of a container, you can use a file-based secrets implementation.


## Client Event Listeners

To override the default listeners, pass an array of IClientEventListener<T> to the BotClient constructor.
The type can be any of [Discord's ClientEvents](https://discord.js.org/#/docs/main/stable/class/Client).
A base implementation is provided that can be easily extended:
```ts
class ThreatCreateEventListener extends BaseClientEventListener<'threadCreate'> {
    constructor() {
        super('threatCreate');
    }

    public listener = function (thread: ThreadChannel) {
        this.logger.info(thread.id);
    }.bind(this);
}

const listeners = [ new ThreatCreateEventListener() ];
const client = new BotClient(listeners);
```

## Adding Commands

Commands are the application commands that will be registered and used by the client.  These are registered against all guilds that the bot is part of.

To create a new command, extend the BaseCommand class:
```ts
class PingCommand extends BaseCommand {
    constructor() {
        super('ping', 'replies with pong!');
    }

    async onInteraction(interaction: CommandInteraction<CacheType>): Promise<any> {
        return await interaction.reply('Pong!');
    }
}
```

### Command Permissions

You can add specific permissions to commands by overriding the `getPermissions` method in your command.  When this method returns an array with a length >= 1, it will also set the default permission of the command (for that guild) to false.  The Client and Guild objects are passed to this method to allow for guild-specific implementations, as all guilds might not have the same permissions.

As an example, we can restrict access to the Ping command to _only_ the owner of the guild:
```ts
class PingCommand extends BaseCommand {
    constructor() {
        super('ping', 'replies with pong!');
    }

    async onInteraction(interaction: CommandInteraction<CacheType>): Promise<any> {
        return await interaction.reply('Pong!');
    }

    override getPermissions(guild: Guild, client: Client): ApplicationCommandPermissionData[] | Promise<ApplicationCommandPermissionsData[]> {
        const ownerOnly: ApplicationCommandPermissionData = {
            id: guild.ownerId,
            type: 'USER',
            permission: true
        };
        return [ ownerOnly ];
    }
}
```

### Command Options
The BaseCommand has properties for different types of command options:
- IntegerOptions
- StringOptions
- UserOptions
- BooleanOptions
- NumberOptions

These are an empty array by default.  If you want to add options to your command, override the properties as appropriate.  
As an example, we can create a command that says hello to a user:
```ts
class HelloCommand extends BaseCommand {
    constructor() {
        super('hello', 'says hello to a specific user');
    }

    async onInteraction(interaction: CommandInteraction<CacheType>): Promise<any> {
        const commandUser = interaction.user.username;
        const targetUser = interaction.options.getUser('user', true);
        return await interaction.reply(`Hey ${targetUser}, ${commandUser} wanted to say hi! :wave:`);
    }

    protected override userOptions: SlashCommandUserOption[] = [
        new SlashCommandUserOption()
            .setName('user')
            .setDescription('the user you want to greet')
            .setRequired(true)
    ];
}
```

## Running the Bot
To run the bot:
- Create an instance of the BotClient
- Start the client (this also authenticates)
- Add your commands to the client

```ts
const client = new BotClient();
await client.start();
await client.addCommands(commands);
```

# Licenses
This is licensed under the MIT license.  Please see the [LICENSE.md](LICENSE.md)

[discord.js is licensed under Apache v2](https://github.com/discordjs/discord.js/blob/main/packages/discord.js/LICENSE)
[discord.js/builder is licensed under Apache v2](https://github.com/discordjs/discord.js/blob/main/packages/builders/LICENSE)
