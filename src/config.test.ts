
import { jest, describe, it, expect, afterEach, beforeEach } from '@jest/globals';
import fs from 'fs';
import { DefaultConfig } from './model.js';

describe('getConfig Utility', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.argv = originalArgv;
    jest.restoreAllMocks();
  });

  it('should return default config when no file or args are provided', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    
    process.argv = ['node', 'jest'];

    // ACT: Run the function
    const { default: getConfig } = await import('./config.js');
    const config = getConfig();

    expect(config).toEqual(expect.objectContaining(DefaultConfig as any));
  });

  it('should load configuration from proxee.config.json', async () => {
    const fileConfig = { port: 9000, target: 'http://file.config.com' };

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(fileConfig));
    
    const { default: getConfig } = await import('./config.js');
    const config = getConfig();

    expect(config.port).toBe(9000);
    expect(config.target).toBe('http://file.config.com');
  });

  it('should have command-line arguments override all other configs', async () => {
    const fileConfig = { port: 9000, target: 'http://file.config.com' };
    
    process.argv = [
        'node',
        'jest',
        '--port=9999',
        '--logPath=cli/log'
    ];
    
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(fileConfig));

    const { default: getConfig } = await import('./config.js');
    const config = getConfig();
        expect(config.port).toBe(9999);
    expect(config.target).toBe('http://file.config.com');
  });
});