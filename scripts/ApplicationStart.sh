#!/bin/bash

echo "Application start"

sudo npm install
pm2 start server.js
