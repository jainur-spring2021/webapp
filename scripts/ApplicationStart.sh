#!/bin/bash

echo "Application start"

sudo npm install
sudo pm2 start server.js
