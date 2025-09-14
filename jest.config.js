module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}",
  ],
  transform: {
    "^.+.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.json",
      },
    ],
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
  moduleNameMapper: {
    "^@/src/(.*)$": "<rootDir>/src/$1",
  },
};
