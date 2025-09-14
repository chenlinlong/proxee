/*
 * @Date: 2025-09-15 00:10:55
 * @LastEditors: chenlinlong 786785040@qq.com
 * @LastEditTime: 2025-09-15 00:37:02
 * @FilePath: \@linlong-proxee\src\logger.ts
 */
// src/logger.ts
import log4js from 'log4js';
import path from 'path';

// 我们先硬编码日志路径，之后可以升级为从配置文件读取
const logFilePath = path.resolve(process.cwd(), 'logs/pro.log');

log4js.configure({
    appenders: {
        // 定义一个输出到文件的 appender
        fileLogger: {
            type: 'dateFile',
            filename: logFilePath,
            pattern: 'yyyy-MM-dd',      // 每天创建一个新日志文件
            alwaysIncludePattern: true,
            compress: true,             // 自动压缩旧的日志文件
            layout: {
                type: 'pattern',
                // 定义日志格式
                pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] - %m'
            }
        }
    },
    categories: {
        // 默认分类，使用我们定义的 fileLogger
        default: { appenders: ['fileLogger'], level: 'info' }
    }
});

// 导出 logger 实例
const logger = log4js.getLogger();

export default logger;