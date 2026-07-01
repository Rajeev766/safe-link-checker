/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@safe-link-checker/([^/]+)/(.+?)(?:\\.js|\\.ts)?$': '<rootDir>/../$1/src/$2.ts',
    '^@safe-link-checker/([^/]+)$': '<rootDir>/../$1/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  collectCoverageFrom: [
    '<rootDir>/../core/src/**/*.ts',
    '<rootDir>/../browser-runtime/src/**/*.ts',
    '<rootDir>/../edge-runtime/src/**/*.ts',
    '<rootDir>/../node-runtime/src/**/*.ts',
    '<rootDir>/../plugins/src/**/*.ts',
    '<rootDir>/../providers/src/**/*.ts',
    '<rootDir>/../shared/src/**/*.ts',
    '<rootDir>/../types/src/**/*.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json'],
};
