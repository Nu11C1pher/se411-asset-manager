#!/bin/sh
set -eu
cd "$(dirname "$0")"
npm ci
npm test
npm run build
cd backend
./mvnw clean verify
