# Jest Configuration
{
  "testEnvironment": "node",
  "testMatch": [
    "**/*.test.js"
  ],
  "coverageDirectory": "coverage",
  "collectCoverageFrom": [
    "src/**/*.js",
    "!src/main.js" // Skip main process for now
  ]
}
