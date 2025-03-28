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
    '<rootDir>/src/app/components/*.{js,jsx,ts,tsx}',
  ],
  transformIgnorePatterns: [
    // "/node_modules/(?!(ol)/).*/",
    "node_modules/(?!(ol)/)",
  ],
  coveragePathIgnorePatterns:[
    "/node_modules/",
    "<rootDir>/src/app/components/MapContext.tsx",
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  roots: ['<rootDir>/__tests__'],
  testMatch: ["**/*.(spec|test).[jt]s?(x)"],
  fakeTimers: { enableGlobally: true },

  // Add moduleNameMapper to mock CSS files
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
    "^ol$": "<rootDir>/__mocks__/ol/ol.js",
    "^ol/source$": "<rootDir>/__mocks__/ol/source/source.js",
    "^ol/source/Vector$": "<rootDir>/__mocks__/ol/source/Vector.js",
    "^ol/source/XYZ$": "<rootDir>/__mocks__/ol/source/XYZ.js",
    "^ol/control.js$": "<rootDir>/__mocks__/ol/control.js",
    "^ol/proj.js$": "<rootDir>/__mocks__/ol/proj.js",
    "^ol/layer/Tile$": "<rootDir>/__mocks__/ol/layer/Tile.js",
    "^ol/layer/Vector$": "<rootDir>/__mocks__/ol/layer/Vector.js",
    "^ol/layer/Image$": "<rootDir>/__mocks__/ol/layer/Image.js",
    "^ol/style/Style$": "<rootDir>/__mocks__/ol/style/Style.js",
    "^ol/style/Stroke$": "<rootDir>/__mocks__/ol/style/Stroke.js",
    "^ol/style/Fill$": "<rootDir>/__mocks__/ol/style/Fill.js",
    "^ol/geom/Polygon.js$": "<rootDir>/__mocks__/ol/geom/Polygon.js",
    '^react-i18next$': '<rootDir>/__mocks__/react-i18next.js',
    "^ol/format$": "<rootDir>/__mocks__/ol/format.js",
    "^ol/style$": "<rootDir>/__mocks__/ol/style.js",
  },
};
