#!/usr/bin/env bash

# Try to stop current delayed_job daemon if any
FILE=/var/app/current/tmp/pids/delayed_jobs_pool.pid
if test -f "$FILE"; then
    kill $(cat $FILE) || /bin/true
fi
