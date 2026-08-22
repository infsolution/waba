declare const _default: () => {
    port: number;
    env: string;
    meta: {
        appId: string;
        appSecret: string;
        graphApiVersion: string;
        graphBaseUrl: (wabaId?: string) => string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    rateLimit: {
        ttl: number;
        limit: number;
    };
    encryption: {
        key: string;
    };
};
export default _default;
