#!/bin/bash

echo "Application start"

cd /home/ubuntu/
sudo npm install
sudo pm2 start server.js
