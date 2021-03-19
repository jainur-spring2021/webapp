#!/bin/bash

echo "Application start"

sudo npm install
sudo pm2 start /home/ubuntu/server.js
