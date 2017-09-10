"use strict";

let jibo = require ('jibo');
let Status = jibo.bt.Status;
let routes = require('./routes')
let express = require('express');
let app = express();

jibo.init('face', function(err) {
    if (err) {
        return console.error(err);
    }
    // Load and create the behavior tree
    let root = jibo.bt.create('../behaviors/main');
    root.start();

    // Listen for the jibo main update loop
    jibo.timer.on('update', function(elapsed) {
        // If the tree is in progress, keep updating
        if (root.status === Status.IN_PROGRESS) {
            root.update();
        }
    });
    createServer();
});

function createServer() {
  routes(app);
  app.listen(3000, (err) => {
    console.log(err);
  })
}
