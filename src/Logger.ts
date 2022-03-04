import {
    addColors,
    createLogger,
    format,
    Logger,
    transport,
    transports
} from 'winston';
import { Format, TransformableInfo } from 'logform';

import { env } from './Env';

const { combine, colorize, timestamp, label, printf, errors } = format;

export interface IDiscordLogger {
    audit(message: unknown): void;
    error(message: unknown): void;
    warn(message: unknown): void;
    info(message: unknown): void;
    debug(message: unknown): void;
    silly(message: unknown): void;
}

export class DiscordLogger implements IDiscordLogger {
    private readonly fileName: string;
    private readonly logger: Logger;

    constructor(fileName: string) {
        this.fileName = fileName;
        addColors(this.colors);
        this.logger = this.createLogger();
        this.logger
    }

    audit(message: unknown): void {
        this.logger.log('audit', message);
    }
    
    error(message: unknown): void {
        this.logger.error(message);
    }

    warn(message: unknown): void {
        this.logger.warn(message);
    }

    info(message: unknown): void {
        this.logger.info(message);
    }

    debug(message: unknown): void {
        this.logger.debug(message);
    }

    silly(message: unknown): void {
        this.logger.silly(message);
    }

    private levels = {
        audit: 0,
        fatal: 1,
        error: 2,
        warn: 3,
        info: 4,
        debug: 5,
        silly: 6
    };

    private colors = {
        fatal: 'bold underline red',
        error: 'red',
        warn: 'yellow',
        audit: 'bold cyan',
        info: 'blue',
        debug: 'green',
        silly: 'magenta'
    };

    private createLogger(): Logger {
        return createLogger({
            format: errors({ stack: true }),
            level: env.logLevel,
            levels: this.levels,
            transports: [
                this.getConsoleTransport()
            ]
        });
    }

    private defaultFormat(): Format {
        return printf((info: TransformableInfo) => {
            const { timestamp, label, level, stack } = info;
            let { code, message } = info;
            code = code ? `${code} ` : '';
            message = stack || message;
        
            // Attempt to log objects as well
            if (typeof message !== 'string') {
                try {
                    message = JSON.stringify(message);
                } catch (ignore) {
                    message = '[Object object]';
                }
            }
        
            return `${timestamp} [${label}] ${level}: ${code}${message}`;
        });
    }

    private getConsoleTransport(): transport {
        return new transports.Console({
            level: env.logLevel,
            format: combine(
                colorize(),
                timestamp(),
                label({ label: this.fileName }),
                this.defaultFormat()
            )
        });
    }
}
