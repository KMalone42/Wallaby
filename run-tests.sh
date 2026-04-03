#!/bin/bash

# Run all unit tests
node --test test/unit/*.js

# Run all integration tests
node --test test/integration/*.js

# Run all e2e tests
node --test test/e2e/*.js

# Run all feature tests
node --test test/features/*.js

# Run all tests in order
node --test test/unit/*.js test/integration/*.js test/e2e/*.js test/features/*.js
