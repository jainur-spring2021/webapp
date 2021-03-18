#!/bin/bash

echo "Application start"

sudo npm install pm2 -g
sudo npm install
sudo pm2 start server.js
# 