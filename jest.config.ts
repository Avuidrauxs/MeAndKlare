import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  globalSetup: './test_utils/jest.setup.ts',
  globalTeardown: './test_utils/jest.teardown.ts',
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 90,
      statements: 90,
    },
  },
  coveragePathIgnorePatterns: ['./src/core/lib/langchain']
};

export default config;
