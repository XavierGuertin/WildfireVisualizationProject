module.exports = {
  displayName: 'frontend',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(ol|another-esm-library)/)'],
  rootDir: './',
  collectCoverage: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '<rootDir>/coverage/apps/frontend',
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,jsx,ts,tsx}', '!<rootDir>/src/app/layout.tsx'],
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
  },
};
