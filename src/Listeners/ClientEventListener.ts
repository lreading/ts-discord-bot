import { Awaitable, ClientEvents } from 'discord.js';
import { DiscordLogger } from '../Logger';

export interface IClientEventListener<K extends keyof ClientEvents> {
    name: K;
    listener: (...args: ClientEvents[K]) => Awaitable<void>;
}

export abstract class BaseClientEventListener<K extends keyof ClientEvents> implements IClientEventListener<K> {
    readonly name: K;
    protected readonly logger: DiscordLogger;

    constructor(name: K) {
        this.name = name;
        this.logger = new DiscordLogger(`${name}EventListener`);
    }

    abstract listener: (...args: ClientEvents[K]) => Awaitable<void>;    
}