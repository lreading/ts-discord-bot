import {
    ApplicationCommandPermissionData, 
    CacheType,
    Client,
    CommandInteraction,
    Guild
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

/*
    Define your commands.  The constructor expects the name and description of the command.
    Additional/optional fields:
        - integerOptions: An array of integer options used in the command
        - stringOptions: An array of string options used in the command
        - userOptions: An array of user options used in the command
        - booleanOptions: An array of user options used in the command
        - numberOptions: An array of user options used in the command

    Methods you may want to override:
        - getPermissions(guildId: Snowflake): Return an array of permissions for the command
            These might be guild dependent, you can return either an array or a Promise
            if you need to do database lookups or something else to determine the correct
            permissions for that specific guild 
*/
class PingCommand extends BaseCommand {
    constructor() {
        super('ping', 'replies with pong!');
    }

    async onInteraction(interaction: CommandInteraction<CacheType>): Promise<any> {
        return await interaction.reply('Pong!');
    }

    override getPermissions(guild: Guild, client: Client): ApplicationCommandPermissionData[] {
        const ownerOnly: ApplicationCommandPermissionData = {
            id: guild.ownerId,
            type: 'USER',
            permission: true
        };
        return [ ownerOnly ];
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
