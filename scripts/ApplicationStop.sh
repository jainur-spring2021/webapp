#!/bin/bash

echo "Application stop"
pm2 delete server || true
pm2 delete all
sudo rm -rf /home/ubuntu/*