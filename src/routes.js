"use strict";

let jibo = require('jibo');
let ip = require('ip');
let base64Img = require('base64-img');

function init(app) {

  app.get('/ip', function (req, res) {
    let address = ip.address();
    jibo.tts.speak(address, (err) => {
      if(err) {
        res.send(err.message);
      }
    });
    res.send(address);
  });


  app.get('/speak', function (req, res) {
    let sentence = req.query.words;
    if(!sentence) {
      if(!res.headerSent) {
        res.json({ success : false });
      }
      return;
    }
    jibo.tts.speak(sentence, (err) => {
      console.log('Test Error:'+err);
      if(!res.headerSent) {
        res.json({ success : false });
      }
      return;
    });
    if(!res.headerSent) {
      res.json({ success : true });
    }
    return;
  });

  app.get('/blink', (req, res) => {
    jibo.animate.blink();
    res.json({success:true})
    return;
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
    return;
  })

  app.get('/eye', (req, res) => {
    let show = req.query.show;
    if(show == undefined || show == 'false') {
      show = false;
    } else {
      show = true;
    }
    jibo.animate.setEyeVisible(show);
    res.json({ success : true });
    return;
  })

  app.get('/move', function (req, res)  {
    console.log('Move command received')
    let x = req.query.x;
    let y = req.query.y;
    let z = req.query.z;
    if(x == null || y == null || z == null) {
      res.json({ success: false, message : 'Missing parameters'});
      return;
    }
    let animate = jibo.animate;
    let builder = animate.createLookatBuilder();
    builder.setContinuousMode(false);
    let target = new animate.THREE.Vector3(x, y, z);
    builder.setDOFs(null);

    var callbackListener = function (eventType, targetInstance) {
      builder.off(jibo.animate.LookatEventType.TARGET_REACHED, this);
      builder.off(jibo.animate.LookatEventType.STOPPED, this);
      builder.off(jibo.animate.LookatEventType.CANCELLED, callbackListener);
      console.log(`${eventType}`);
      res.json({success: true});
    }

    builder.on(jibo.animate.LookatEventType.STOPPED, callbackListener);
    builder.on(jibo.animate.LookatEventType.CANCELLED, callbackListener);
    builder.on(jibo.animate.LookatEventType.TARGET_REACHED, callbackListener);
    console.log("Movement started")
    var instance = builder.startLookat(target);
  })

  app.get('/photo', (req, res) => {
    let camera = req.query.camera;
    let nodistortion = req.query.distortion;
    let resolution = req.query.resolution;
    if(!camera) {
      camera = jibo.lps.CameraID.LEFT;
    } else {
      if(camera == 'left') {
        camera = jibo.lps.CameraID.LEFT;
      } else {
        camera = jibo.lps.CameraID.RIGHT;
      }
    }
    if(!nodistortion || nodistortion == 'true') {
      nodistortion = false;
    } else {
      nodistortion = true;
    }
    if (!resolution || resolution == 'MEDIUM') {
      resolution = jibo.lps.PhotoRes.MEDIUM;
    } else {
      if(resolution == 'SMALL') {
        resolution = jibo.lps.PhotoRes.SMALL;
      } else if (resolution == 'LARGE') {
        resolution = jibo.lps.PhotoRes.LARGE;
      } else {
        resolution = jibo.lps.PhotoRes.XLARGE;
      }
    }

    jibo.lps.takePhoto(resolution, nodistortion, camera, jibo.lps.PhotoType.FULL, onTakePhoto)

    function onTakePhoto(err, url) {
      if(err) {
        res.json({success : false, message : err.message})
        return
      }
      base64Img.requestBase64(url, onConversionComplete);
    }

    function onConversionComplete(err, response, body) {
      if(err) {
        res.json({success : false, message : err.message})
        return
      }
      console.log(response);
      res.json({success:true, imgData: body});
      return;
    }
  })

}

module.exports = init;
