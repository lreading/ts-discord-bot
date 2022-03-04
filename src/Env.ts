const _env: Env = null;

export class Env {
    private _token: string;
    private _applicationId: string;
    private _logLevel: 'silly' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'audit';
    private _maxLogSize = 50;

    public get token(): string {
        return this._token;
    }

    public get applicationId(): string {
        return this._applicationId;
    }

    public get logLevel(): 'silly' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'audit' {
        return this._logLevel;
    }

    public get maxLogSize(): number {
        return this._maxLogSize;
    }

    public load(): void {
        this._applicationId = process.env['DISCORD_APPLICATION_ID'];
        this._token = process.env['DISCORD_TOKEN'];
        this._logLevel = process.env['LOG_LEVEL'] as 'silly' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'audit' || 'info';
        this._maxLogSize = parseInt(process.env['MAX_LOG_SIZE'] || '50', 0);
        this.validate();
    }

    private validate(): void {
        const errorMsg = (name: string) : string => `${name} is a required secret; It must be in process.env['${name}']`;
        if (!this._applicationId) throw new Error(errorMsg('DISCORD_APPLICATION_ID'));
        if (!this._token) throw new Error(errorMsg('DISCORD_TOKEN'));
    }

    static get Instance() {
        return _env === null ? new Env() : _env;
    }
}

export const env = Env.Instance;
