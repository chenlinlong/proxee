/*
 * @Date: 2025-09-15 15:31:13
 * @LastEditors: chenlinlong 786785040@qq.com
 * @LastEditTime: 2025-09-15 18:22:08
 * @FilePath: \@linlongchen-proxee\src\utils.ts
 * @Description: A collection of utility functions used across the application.
 */

import chalk from "chalk";
import * as http from 'http';
import getLogger from './logger.js';

/**
 * Logs the details of a received proxy response to the console and a log file.
 * It handles different status codes with colors and intelligently formats the response body.
 * @param proxyRes The incoming response object from the target server.
 * @param responseBody The full response body as a string (already decompressed if needed).
 * @param duration The total duration of the request/response cycle in milliseconds.
 */
export const logResponse = (proxyRes: http.IncomingMessage, responseBody: string, duration: number): void => {
    // Log to console for real-time debugging.
    console.log(chalk.cyan('--- Response Received ---'));
    console.log(`${chalk.cyan('Duration:')}  ${duration}ms`);

    const status = proxyRes.statusCode || 500;
    // Dynamically choose a color for the status code based on its range (success, client error, server error).
    const statusChalk = status >= 500 ? chalk.red : status >= 400 ? chalk.yellow : chalk.green;
    console.log(`${chalk.cyan('Status:')}    ${statusChalk(status)}`);

    // Attempt to parse the body as JSON for pretty-printing.
    try {
        const body = JSON.parse(responseBody);
        console.log(chalk.cyan('Body:'));
        console.log(JSON.stringify(body, null, 2));
    } catch (e) {
        // If parsing fails, it's likely not JSON (e.g., HTML, plain text). Print it raw.
        console.log(chalk.cyan('Body (Raw Text):'));
        // Truncate long responses to keep the console clean.
        console.log(responseBody.substring(0, 300) + (responseBody.length > 300 ? '...' : ''));
    }
    console.log(chalk.gray('-----------------------'));
    console.log('\n');

    // Log a concise summary to the persistent log file.
    getLogger().info(`[RESPONSE] ${proxyRes.statusCode} for ${proxyRes.url} in ${duration}ms`);
}

