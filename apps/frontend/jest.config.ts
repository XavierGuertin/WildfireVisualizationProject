module.exports = {
  displayName: 'frontend',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  rootDir:"./",
  collectCoverage: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/frontend',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,jsx,ts,tsx}',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  roots: ['<rootDir>/__tests__'],
  testMatch: ["**/*.(spec|test).[jt]s?(x)"],

  // Add moduleNameMapper to mock CSS files
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '^react-i18next$': '<rootDir>/__mocks__/react-i18next.js',
  },
};
