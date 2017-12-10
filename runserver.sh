#!/bin/bash

set -e

sleep 10
npm run migratedb:prod
node run.js

exit 0