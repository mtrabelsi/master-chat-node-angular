# master-chat-node-angular

A full feature Chat server that uses node.js for backend and angular.js for the UI

# Frameworks

- express.js
- socket.io
- angular.js

# Pre-requisites

Before we dive into the doc we assume that Node.js and Bower are already installed in your machine.

# Install

1- install node.js dependencies by running : **npm install**

2- install bower dependencies (front) : **bower install**

# Run

To start the server just run this command: **node index.js**
Then in your browser go to:  http://localhost:8080/

# Foundation

The Architecture is very simple, basically we've two important folders :

1- the **server** folder : where the api and server side notifications lies.

2- the **frontend** folder : it's divided into sub-folders where each folder represent an angular module.

3- bower_modules and node_modules are respectively the bower and node dependencies folders.

