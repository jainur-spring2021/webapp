#!/bin/bash

echo "Application start"

sudo service codedeploy-agent status
sudo npm install pm2 -g
sudo npm install
sudo pm2 start --name server npm -- start
sudo rm -rf /home/ubuntu/*