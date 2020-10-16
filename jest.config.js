module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: ['./src/**/*.ts', '!./tests/**/*.ts'],
  collectCoverage: true,
  coverageReporters: ['lcov', 'json', 'html', 'text', 'text-summary'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.build/'],
  coverageDirectory: 'tests/coverage',
  testMatch: ['**/*.test.[jt]s?(x)'],
};
