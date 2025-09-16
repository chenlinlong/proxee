/*
 * @Date: 2025-09-15 16:25:47
 * @LastEditors: chenlinlong 786785040@qq.com
 * @LastEditTime: 2025-09-15 18:22:43
 * @FilePath: \@linlongchen-proxee\src\model.ts
 */
export interface IConfig {
    port: number;
    target: string;
    logPath: string;
    logLevel: string;
}
export const DefaultConfig: IConfig = {
    port: 8080,
    target: 'http://localhost:3000',
    logPath: 'logs/pro',
    logLevel: 'info',
}