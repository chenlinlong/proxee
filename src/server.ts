/*
 * @Author: chenlinlong 786785040@qq.com
 * @Date: 2025-09-10 21:53:19
 * @LastEditors: chenlinlong 786785040@qq.com
 * @LastEditTime: 2025-09-15 00:22:52
 * @FilePath: \@linlong-proxee\src\server.ts
 * @Description: 
 */

import express, { type Request, type Response } from 'express';
import chalk from "chalk";
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as http from 'http';
import * as zlib from 'zlib';
import logger from './logger.js';

const server = () => {
	const app = express();
	const PORT = 8080; // proxee's port

	const onProxyReq = (proxyReq: http.ClientRequest, req: Request, res: Response) => {
		(req as any).startTime = Date.now();
		console.log(chalk.green('--- New Request ---'));
		console.log(`${chalk.yellow('URL:')}       ${req.protocol}://${req.hostname}:${PORT}${req.url}`);
		console.log(`${chalk.yellow('Time:')}      ${new Date().toLocaleString()}`);
		console.log(`${chalk.yellow('Method:')}    ${req.method}`);
		console.log(chalk.yellow('Headers:'));
		console.log(JSON.stringify(req.headers, null, 2));

		// 检查是否有请求体
		if (req.body && Object.keys(req.body).length) {
			console.log(chalk.yellow('Body:'));
			console.log(JSON.stringify(req.body, null, 2));
		}
		console.log(chalk.gray('--------------------'));
		const ip = req.ip || req.socket.remoteAddress;
		logger.info(`[REQUEST] ${req.method} ${req.url} from ${ip}`);
	}

	const onProxyRes = (proxyRes: http.IncomingMessage, req: Request, res: Response) => {
		// 下一步我们会在这里写响应日志
		let body: Buffer[] = [];
		proxyRes.on('data', (chunk: Buffer) => {
			body.push(chunk);
		});

		proxyRes.on('end', () => {
			const endTime = Date.now();
			const startTime = (req as any).startTime || endTime;
			const duration = endTime - startTime;

			const responseBuffer = Buffer.concat(body);
			const encoding = proxyRes.headers['content-encoding'];

			// 1. 检查响应头，看是否是gzip压缩
			if (encoding === 'gzip') {
				// 2. 如果是，就进行解压
				zlib.gunzip(responseBuffer, (err, decompressedBuffer) => {
					if (err) {
						console.error(chalk.red('Error decompressing response:'), err);
						return;
					}
					logResponse(proxyRes, decompressedBuffer.toString('utf8'), duration); // 调用一个统一的日志函数
				});
			} else {
				// 3. 如果没有压缩，或者是不认识的压缩格式，直接转字符串
				logResponse(proxyRes, responseBuffer.toString('utf8'), duration); // 调用一个统一的日志函数
			}
		});
	}

	app.use(createProxyMiddleware({
		target: 'http://localhost:3000',
		changeOrigin: true,
		on: {
			proxyReq: onProxyReq,
			proxyRes: onProxyRes
		}
	}));

	app.listen(PORT, () => {
		console.log(chalk.blue('*******************************'));
		console.log(chalk.yellow.bold('代理模式已启动'));
		console.log(`端口 -> ${chalk.red.bold(PORT)}`);
		console.log(chalk.blue('*******************************'));
	});
}

export default server;


// 把它放在 onProxyRes 外面，或者另一个工具文件里
const logResponse = (proxyRes: http.IncomingMessage, responseBody: string, duration: number) => {
	console.log(chalk.cyan('--- Response Received ---'));

	console.log(`${chalk.cyan('Duration:')}  ${duration}ms`);
	const status = proxyRes.statusCode || 500;
	const statusChalk = status >= 500 ? chalk.red : status >= 400 ? chalk.yellow : chalk.green;
	console.log(`${chalk.cyan('Status:')}    ${statusChalk(status)}`);

	try {
		const body = JSON.parse(responseBody);
		console.log(chalk.cyan('Body:'));
		console.log(JSON.stringify(body, null, 2));
	} catch (e) {
		console.log(chalk.cyan('Body (Raw Text):'));
		// 截取一部分，防止打印超长的HTML页面
		console.log(responseBody.substring(0, 300) + (responseBody.length > 300 ? '...' : ''));
	}
	console.log(chalk.gray('-----------------------'));
	console.log('\n');
	logger.info(`[RESPONSE] ${proxyRes.statusCode} for ${proxyRes.url} in ${duration}ms`);
}