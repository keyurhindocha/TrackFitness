// Two projects: plain logic tests run in Node; screen tests render React
// Native components through jest-expo.
module.exports = {
  globalSetup: './jest.global-setup.js',
  projects: [
    {
      displayName: 'logic',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/**/__tests__/**/*.test.js'],
      testPathIgnorePatterns: ['<rootDir>/src/screens/'],
    },
    {
      displayName: 'screens',
      preset: 'jest-expo',
      testMatch: ['<rootDir>/src/screens/**/__tests__/**/*.test.js'],
    },
  ],
};
