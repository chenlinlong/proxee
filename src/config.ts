/*
 * @Date: 2025-09-15 15:33:37
 * @LastEditors: chenlinlong 786785040@qq.com
 * @LastEditTime: 2025-09-15 18:21:16
 * @FilePath: \@linlong-proxee\src\config.ts
 * @Description: This module handles all configuration loading for the proxee application.
 * It follows a hierarchical approach to merge configurations from three sources:
 * 1. Default values (hardcoded).
 * 2. A JSON configuration file ('proxee.config.json').
 * 3. Command-line arguments.
 * The priority is: Command-line > Config File > Defaults.
 */

import yargs from "yargs";
import { DefaultConfig, type IConfig } from "./model.js";
import path from "path";
import fs from 'fs';
import { hideBin } from "yargs/helpers";

// A private variable to cache the configuration after the first load.
let config: IConfig | null = null;

/**
 * Gets the final, merged configuration for the application.
 * It reads from the config file and command-line arguments, merges them with
 * defaults, and caches the result for subsequent calls.
 * @returns The final, immutable configuration object.
 */
const getConfig = (): IConfig => {
    // If the config has already been calculated, return the cached version to improve performance.
    if (config) {
        return config;
    }

    // 1. Start with the hardcoded default values.
    const defaultConfig: IConfig = DefaultConfig;

    // 2. Attempt to load configuration from a 'proxee.config.json' file in the current directory.
    let fileConfig = {};
    const configFilePath = path.resolve(process.cwd(), 'proxee.config.json');
    if (fs.existsSync(configFilePath)) {
        try {
            fileConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
        } catch (e) {
            console.error('Error reading or parsing proxee.config.json:', e);
        }
    }

    // 3. Parse command-line arguments using yargs to allow for runtime overrides.
    const argv = yargs(hideBin(process.argv))
        .option('port', {
            alias: 'p',
            description: 'Port for proxee to listen on',
            type: 'number',
        })
        .option('target', {
            alias: 't',
            description: 'The target URL to proxy to',
            type: 'string',
        })
        .option('logPath', {
            description: 'Path to the log file',
            type: 'string',
        })
        .help()
        .alias('help', 'h')
        .argv;

    // 4. Merge the configurations. The order is important:
    // later objects in the spread (...) will overwrite earlier ones.
    config = {
        ...defaultConfig,
        ...fileConfig,
        ...argv,
    } as IConfig;

    return config;
}

export default getConfig;