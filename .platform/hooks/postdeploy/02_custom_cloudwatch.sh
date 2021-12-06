#!/usr/bin/env bash
systemctl stop amazon-cloudwatch-agent

mv /opt/aws/amazon-cloudwatch-agent/etc/custom.json.bak /opt/aws/amazon-cloudwatch-agent/etc/beanstalk.json -f
cp /opt/aws/amazon-cloudwatch-agent/etc/beanstalk.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.d/
mv /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.d/beanstalk.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.d/file_beanstalk.json -f

systemctl start amazon-cloudwatch-agent
