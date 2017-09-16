"use strict";

let jibo = require ('jibo');
let Status = jibo.bt.Status;
let routes = require('./routes')
let express = require('express');
let cors = require('cors');
let app = express();

jibo.init('face', function() {

    // Load and create the behavior tree
    let root = jibo.bt.create('../behaviors/startup');
    root.start();

    // Listen for the jibo main update loop
    jibo.timer.on('update', function(elapsed) {
        // If the tree is in progress, keep updating
        if (root.status === Status.IN_PROGRESS) {
            root.update();
        }
    });

    jibo.animate.setEyeVisible(true);
    createServer();
});

function createServer() {
  app.use(cors());
  routes(app);
  app.listen(3000, (err) => {
    if(err) {
      console.log(err.message);
    }
  })
}
