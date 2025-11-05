#!/bin/sh
# Railway nixpacks start command
# This script will be executed by Railway's cron service

echo "Starting lapsed members cron job at $(date)"
node expired-data-for-ym.js
echo "Completed at $(date)"
