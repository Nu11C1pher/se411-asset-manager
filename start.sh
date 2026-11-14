#!/bin/sh
set -eu
cd "$(dirname "$0")"
java -jar backend/target/asset-manager-1.0.0.jar
