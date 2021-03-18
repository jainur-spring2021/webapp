echo "Application stop"

sudo npm install
sudo pm2 stop --name testServer
sudo pm2 delete testServer