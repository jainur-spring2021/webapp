#!/bin/bash

echo "Application stop"
pm2 delete server || true
sudo pm2 delete all
sudo rm -rf /home/ubuntu/*