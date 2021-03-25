#!/bin/bash

echo "Application start"

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/ubuntu/cloud-config/cloud-watch-agent-config.json -s
sudo systemctl start amazon-cloudwatch-agent.service

cd /home/ubuntu/
sudo npm install
sudo pm2 start server.js
