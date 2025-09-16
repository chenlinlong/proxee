
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as http from 'http';

describe('logResponse Utility', () => {

    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should log a successful response and call the file logger', async () => {
        const loggerModule = await import('../logger.js');
        
        const infoSpy = jest.spyOn(loggerModule.default(), 'info').mockImplementation(() => {});

        const { logResponse } = await import('../utils.js');

        const fakeProxyRes = {
            statusCode: 200,
            url: '/api/data'
        } as http.IncomingMessage;
        const responseBody = JSON.stringify({ message: 'success' });
        const duration = 123;

        logResponse(fakeProxyRes, responseBody, duration);

        expect(infoSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledWith('[RESPONSE] 200 for /api/data in 123ms');
    });

    it('should log a server error response correctly', async () => {
        const loggerModule = await import('../logger.js');
        const infoSpy = jest.spyOn(loggerModule.default(), 'info').mockImplementation(() => {});

        const { logResponse } = await import('../utils.js');
        
        const fakeProxyRes = {
            statusCode: 500,
            url: '/api/error'
        } as http.IncomingMessage;
        const responseBody = 'Internal Server Error';
        const duration = 456;

        logResponse(fakeProxyRes, responseBody, duration);

        expect(infoSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledWith('[RESPONSE] 500 for /api/error in 456ms');
    });
});