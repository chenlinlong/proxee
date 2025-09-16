/*
 * @Date: 2025-09-15 00:10:55
 * @LastEditors: chenlinlong 786785040@qq.com
 * @LastEditTime: 2025-09-15 18:19:50
 * @FilePath: \@linlongchen-proxee\src\logger.ts
 * @Description: This module configures and exports a singleton instance of the log4js logger.
 * It sets up a file-based logger that rotates daily, making it suitable for
 * persistent logging in a server application.
 */
import log4js, { type Logger } from 'log4js';
import path from 'path';
import getConfig from './config.js';
import type { IConfig } from './model.js';

// A private variable to cache the configuration after the first load.
let logger: Logger | null = null;

const getLogger = (): Logger => {
    // If the config has already been calculated, return the cached version to improve performance.
    if (logger) {
        return logger;
    }

    // Retrieve the application's configuration to get settings like the log path.
    const config: IConfig = getConfig();

    // Create an absolute path for the log file based on the current working directory
    // and the path provided in the config. This ensures the path is always correct.
    const logFilePath: string = path.resolve(process.cwd(), config.logPath);

    // Configure the log4js logger. This setup only needs to run once when the app starts.
    log4js.configure({
        appenders: {
            // Define an "appender" which is a destination for logs. We name it 'fileLogger'.
            fileLogger: {
                type: 'dateFile',           // Use the dateFile type for automatic log rotation.
                filename: logFilePath,      // The base path and name for the log files.
                pattern: 'yyyy-MM-dd.log', // A new file will be created each day, e.g., 'proxee.log.2025-09-15'.
                compress: true,             // Automatically compress old log files into .gz format.
                alwaysIncludePattern: true,
                layout: {
                    type: 'pattern',
                    // Define the format for each log entry.
                    pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] - %m'
                }
            }
        },
        categories: {
            // Define a 'default' category that uses our fileLogger and sets the log level.
            // The log level is dynamically set from the user's configuration.
            default: { appenders: ['fileLogger'], level: config.logLevel }
        }
    });

    logger = log4js.getLogger() as Logger;

    // Get an instance of the configured logger.
    return logger;
}

export default getLogger;