module.exports = {
  displayName: 'frontend',
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Use jsdom for React components
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest', // Use babel-jest to support JSX and TypeScript
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/frontend',
  roots: ['<rootDir>/__tests__'],
  testMatch: ["**/*.(spec|test).[jt]s?(x)"],
};