#!/bin/bash

echo "Application start"

cd /home/ubuntu/
sudo npm install
pm2 start server.js
