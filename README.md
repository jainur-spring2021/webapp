# webapp

# Prerequisites for building and deploying your application locally.
Install Visual Studio, Node.js, npm , Postman and Git bash

# Build and Deploy instructions for web application.
Step 1: Clone git repository and run 'npm init' to intialize the repository.\
Step 2: Run 'npm install' to install all the dependencies specified in package.json\
Step 3: Before starting the node server, start Mysql services.\
Step 4: Run 'node server.js to start the server'\
Step 5: Start Postman and hit the enpoints:\

# Assignment 1 Endpoints:
POST localhost:3000/api/users \
GET localhost:3000/api/users/userAcc \
PUT localhost:3000/api/users/updateAccount

# Assignment 2 endpoints
POST  localhost:3000/api/book \
GET   localhost:3000/api/book/:id \
GET   localhost:3000/api/book \
DELETE    localhost:3000/api/book/:id 
