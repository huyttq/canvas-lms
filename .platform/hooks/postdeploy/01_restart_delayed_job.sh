#!/usr/bin/env bash

# Adds a post-deploy hook such that after a new version is deployed
# successfully, restarts the delayed_job workers.
#
# http://stackoverflow.com/questions/14401204/how-to-automatically-restart-delayed-job-when-deploying-a-rails-project-on-amazo
# http://www.dannemanne.com/posts/post-deployment_script_on_elastic_beanstalk_restart_delayed_job

# Start delayed_job
/bin/bash -c "/var/app/current/script/canvas_init restart"
