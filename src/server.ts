/*
 * @Author: chenlinlong 786785040@qq.com
 * @Date: 2025-09-10 21:53:19
 * @LastEditors: chenlinlong 786785040@qq.com
 * @LastEditTime: 2025-09-15 17:52:12
 * @FilePath: \@linlongchen-proxee\src\server.ts
 * @Description: This is the core server file for the proxee application.
 * It creates an Express server, configures the http-proxy-middleware,
 * and handles the logging of requests and responses.
 */

import express, { type Request, type Response } from 'express';
import chalk from "chalk";
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as http from 'http';
import * as zlib from 'zlib';
import { logResponse } from './utils.js';
import getConfig from './config.js';
import getLogger from './logger.js';
import type { IConfig } from './model.js';
import type { Logger } from 'log4js';

const server = () => {
	const app = express();
	const config: IConfig = getConfig();
	const PORT: number = config.port;
	const logger: Logger = getLogger();

	/**
	 * Event handler for when a request is about to be proxied.
	 * It logs detailed information about the incoming request to the console and a log file.
	 * @param proxyReq - The outgoing request object to the target server.
	 * @param req - The original incoming request object from the client.
	 * @param res - The original response object.
	 */
	const onProxyReq = (proxyReq: http.ClientRequest, req: Request, res: Response) => {
		// Attach a timestamp to the request object to calculate the request duration later.
		// We use `(req as any)` to dynamically add this property.
		(req as any).startTime = Date.now();

		console.log(chalk.green('--- New Request ---'));
		console.log(`${chalk.yellow('URL:')}       ${req.protocol}://${req.hostname}:${PORT}${req.url}`);
		console.log(`${chalk.yellow('Time:')}      ${new Date().toLocaleString()}`);
		console.log(`${chalk.yellow('Method:')}    ${req.method}`);
		console.log(chalk.yellow('Headers:'));
		console.log(JSON.stringify(req.headers, null, 2));

		// Note: The request body cannot be logged here reliably without interfering
		// with the stream forwarding. The proxy is kept transparent.

		console.log(chalk.gray('--------------------'));

		// Log a concise summary to the file.
		const ip = req.ip || req.socket.remoteAddress;
		logger.info(`[REQUEST] ${req.method} ${req.url} from ${ip}`);
	}

	/**
	 * Event handler for when a response is received from the target server.
	 * It captures the response body, handles potential gzip compression, and logs
	 * the response details.
	 * @param proxyRes - The incoming response object from the target server.
	 * @param req - The original incoming request object from the client.
	 * @param res - The original response object.
	 */
	const onProxyRes = (proxyRes: http.IncomingMessage, req: Request, res: Response) => {
		const body: Buffer[] = [];
		proxyRes.on('data', (chunk: Buffer) => {
			body.push(chunk);
		});

		proxyRes.on('end', () => {
			const endTime = Date.now();
			const startTime = (req as any).startTime || endTime;
			const duration = endTime - startTime;

			const responseBuffer = Buffer.concat(body);
			const encoding = proxyRes.headers['content-encoding'];

			// Decompress the response body if it's gzipped.
			// Modern servers often compress responses to save bandwidth.
			if (encoding === 'gzip') {
				zlib.gunzip(responseBuffer, (err, decompressedBuffer) => {
					if (err) {
						console.error(chalk.red('Error decompressing response:'), err);
						logger.error(`[GUNZIP_ERROR] ${err.message}`);
						return;
					}
					const responseBody = decompressedBuffer.toString('utf8');
					logResponse(proxyRes, responseBody, duration);
				});
			} else {
				// Handle uncompressed responses directly.
				const responseBody = responseBuffer.toString('utf8');
				logResponse(proxyRes, responseBody, duration);
			}
		});
	}

	/**
	 * Event handler for proxy errors.
	 * Catches errors during the proxying process (e.g., target server is down)
	 * and sends a standard 500 response to the client.
	 * @param err - The error object.
	 * @param req - The original incoming request object.
	 * @param res - The original response object.
	 */
	const onError = (err: Error, req: Request, res: any) => {
		console.error(chalk.red('Proxy Error:'), err);
		logger.error(`[PROXY_ERROR] ${err.message} for ${req.url}`);

		// Ensure a response is sent to the client so it doesn't hang on timeout.
		if (res instanceof http.ServerResponse && !res.headersSent) {
			res.writeHead(500, {
				'Content-Type': 'application/json'
			});
			res.end(JSON.stringify({ message: 'Proxy Error', error: err.message }));
		}
	}

	// Setup the proxy middleware with all the configurations and event handlers.
	const apiProxy = createProxyMiddleware({
		target: config.target,
		// `changeOrigin` is needed for virtual hosted sites.
		changeOrigin: true,
		// Register our custom event handlers.
		on: {
			proxyReq: onProxyReq,
			proxyRes: onProxyRes,
			error: onError
		}
	});

	app.use(apiProxy);

	// Start the Express server and listen for connections.
	app.listen(PORT, () => {
		console.log(chalk.blue('*******************************'));
		console.log(chalk.yellow.bold('Proxy server is running'));
		console.log(`Listening on port -> ${chalk.red.bold(PORT)}`);
		console.log(`Proxying to -> ${chalk.cyan(config.target)}`);
		console.log(chalk.blue('*******************************'));
	});
}

export default server;