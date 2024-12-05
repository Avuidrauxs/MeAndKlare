import type { Config } from '@jest/types';

const config: Config.InitialOptions =  {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  globalSetup: './test_utils/jest.setup.ts',
  globalTeardown: './test_utils/jest.teardown.ts',
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};

export default config;
