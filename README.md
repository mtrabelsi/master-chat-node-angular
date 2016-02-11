# master-chat-node-angular

A full feature Chat server that uses node.js for backend and angular.js for the UI

# Frameworks

- express.js
- mongoose.js
- socket.io
- angular.js

# Pre-requisites

Before we dive into the doc we assume that Node.js, mongodb and Bower are already installed in your machine.

# Install

1- install node.js dependencies by running : **npm install**

2- install bower dependencies (front) : **bower install**

# Run

The index.js is the file responsible for running the server, it loads all modules, prepare the connection for the dabase and lift the server (by default at the 8080 port).

To start the server just run this command: **node index.js**
Then in your browser go to:  http://localhost:8080/

# TODOS

- Add API Docs
- Webrtc Video/Voice Call
- Extensible Widget system
- Emoticones

# Foundation

The Architecture is very simple, basically we've two important folders :

1- the **server** folder : where the api and server side notifications lies.

2- the **frontend** folder : it's divided into sub-folders where each folder represent an angular module.

3- bower_modules and node_modules are respectively the bower and node dependencies folders.

# Databese

The Chat server stores all data in a **mongodb**  database.
At runtime the server checks for existing databases, if any database named **chatserver** is found then it will be used, elsewhere a new one will be created.

The chat server stores and manage 3 models, **mongoose** models can be found under the server/models folder.

# API

This is the most interesting part of the chat server since you can use and extend an existing fully feature API. The server comes with a several API that can be used with any UI.

The idea behind APIs is to be able to use it from different platforms (including mobile). 
The server already have a default UI demonstrating all features, to see all availble API please refer to the server/api folder and server/api.js file.

# Server side notification (websocket)

Most of our API will trigger an event when they are called, such us joining/leaving a group/room  will fire a websocket event to the UI. the registred events are located in server/events.js file.

