"use strict";

let jibo = require('jibo');
let ip = require('ip');

function init(app) {

  app.get('/ip', (req, res) => {
    let address = ip.address();
    jibo.tts.speak(address, (err) => {
      console.log(err);
    });
    res.send(address);
  });


  app.get('/speak', (req, res) => {
    let sentence = req.query.words;
    if(!sentence) {
      res.json({ success : false });
      return;
    }
    jibo.tts.speak(sentence, (err) => {
      console.log(err);
      res.json({ success : false });
    });
    res.json({ success : true });
  });

  app.get('/blink', (req, res) => {
    jibo.animate.blink();
    res.json({success:true})
  });

  app.get('/led/color', (req, res) => {
    let red = req.query.red;
    let green = req.query.green;
    let blue = req.query.blue;
    if(red == null || green == null || blue == null || red < 0 || green < 0 || blue < 0) {
      res.json({ success : false, message: 'missing parameters' });
      return;
    }
    if (red > 1 || green > 1 || blue > 1) {
      red /= 255;
      green /= 255;
      blue /= 255;
    }
    jibo.animate.setLEDColor([red, green, blue]);
    res.json({ success : true });
  })

  app.get('/eye', (req, res) => {
    let show = req.query.show;
    console.log(show);
    if(show == undefined || show == 'false') {
      show = false;
    } else {
      show = true;
    }
    console.log(show);
    jibo.animate.setEyeVisible(show);
    res.json({ success : true });
  })

  app.get('/move', (req, res) => {
    let x = req.query.x;
    let y = req.query.y;
    let z = req.query.z;
    console.log(x);
    if(x == null || y == null || z == null) {
      res.json({ success: false, message : 'Missing parameters'});
      return;
    }
    let animate = jibo.animate;
    let builder = animate.createLookatBuilder();
    builder.setContinuousMode(false);
    let target = new animate.THREE.Vector3(x, y, z);
    let instance = builder.startLookat(target);
    res.json({success: true});
  })
}

module.exports = init;
