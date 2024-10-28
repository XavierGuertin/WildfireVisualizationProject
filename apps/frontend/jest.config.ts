module.exports = {
  displayName: 'frontend',
  preset: 'ts-jest',
  testEnvironment: 'jsdom', 
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest', 
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/frontend',
  roots: ['<rootDir>/__tests__'],
  testMatch: ["**/*.(spec|test).[jt]s?(x)"],
};