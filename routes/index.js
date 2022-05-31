const {PythonShell} =require('python-shell');
var express = require('express');
var router = express.Router();
var MPlayer = require('mplayer');
var request = require('request');
var macaddress = require('macaddress');
var player = new MPlayer();
var pyshell = new PythonShell('/opt/ElitePy/launcher.py');
var volumeData = 100;
var VLC = require('vlc-simple-player');
var vlcPlayer;
var vPaused = false;
var vLength= 0;
var vCurrPos = 0;
var vVolume = 0;
var seekData = 100;
var macauth = false;
var dgram = require('dgram');
const { status } = require('express/lib/response');
var server = dgram.createSocket("udp4");
server.bind(9999);

// When udp server receive message.
server.on("message", function (message) {
  // Create output message.
  var output = "Udp server receive message : " + message + "\n";
  ReceivedMessage(message);
  //Sample(message);
  // Print received message in stdout, here is log console.
  process.stdout.write(output);
});

// When udp server started and listening.
server.on('listening', function () {
  // Get and print udp server listening ip address and port number in log console. 
  var address = server.address(); 
  console.log('UDP Server started and listening on ' + address.address + ":" + address.port);
});

function checkMyMac(cb){
  macaddress.one().then(function (mac) {
    console.log("Mac address for this host: %s With Promis", mac);
    var options = {
      'method': 'GET',
      'url': 'http://192.168.2.254/efe/busServerDeviceList/'+mac,
      'headers': {
      }
    };
    request(options, function (error, response) {
      if (error){
        console.log(error);
        cb(error);
      }else{
        console.log(response.body);
        cb(null, response.body);
      }
    });
  })
}

function Sample(test){
  player.on('start', console.log.bind(this, 'playback started'));
  player.on('status', console.log);

  player.openPlaylist('http://www.miastomuzyki.pl/n/rmfclassic.pls', {
    cache: 128,
    cacheMin: 1
  });

  setTimeout(player.volume.bind(player, 50), 1000);
}

function ReceivedMessage(message){
  var msg = message+"";
    
  console.log("message received : ", msg);
  checkMyMac(function(err, res){
    if(res == "success"){
      if(message == "resume"){
        console.log("onResume() ", vPaused);
        // player.play();
        if(vlcPlayer!=null){
          
          if(vPaused=true){
            vlcPlayer.request('/requests/status.json?command=pl_play', function(err){
              if(!err){
                console.log("resume ")
                vPaused = false;
              }
            })
          }
        }
        
      }
      
      if(msg.startsWith("playUrl-", 0)){
        var arr = msg.split("-");
        var url = arr[1];
        
        vlcPlayer = new VLC(url.replace(/ /g, "%20"));
        pyshell.kill();
        /*vlcPlayer.on('statuschange', (err, status) => {
          console.log(status);
          if(status.state == "playing"){
             vPaused = false;
          }else{
            vPaused = true;
          }
          vLength = status.length;
          vCurrPos = status.position;
          vVolume = status.volume;
        })*/
        /*player.setOptions({
          cache: 128,
          cacheMin: 1
        })
        
        player.openFile(url);
        
        player.on('ready', () => {
          console.log("player is ready");
          pyshell.kill();
          player.play({fullscreen:1, volume:100});
          player.fullscreen();
          player.volume.bind(player, 100);
          
        })*/
        // player.on('start', console.log.bind(this, 'playback started'));
      }
      if(message == "play"){
        
        player.setOptions({
          cache: 128,
          cacheMin: 1
        })
        player.openFile('/media/pi/TT/efe/movies/english/Rampage.mp4');
        player.on('ready', () => {
          console.log("player is ready ")
          pyshell.kill();
          player.play({})
        })
      }
      if(message == "mute"){
        player.mute();
      }
      if(message == "pause"){
        console.log("onPause() ", vPaused);
        if(vlcPlayer!=null){
          
          if(vPaused==false){
            vlcPlayer.request('/requests/status.json?command=pl_pause', function(err){
              if(!err){
                console.log("paused")
                vPaused = true;
              }
            })
          }
        }
        // player.pause();
      }
      if(message == "stop"){
        // pyshell = new PythonShell('/opt/ElitePy/launcher.py');
        /*if(player!=null){
          player.stop()
        }*/
        if(vlcPlayer!=null){
          vlcPlayer.request('/requests/status.json?command=pl_stop', function(err){
            if(!err){
              console.log("stoped")
              // vlcPlayer.quit();
              pyshell = new PythonShell('/opt/ElitePy/launcher.py');
            }
          })
        }
      }
      if(message == "volumeUp"){
        /*volumeData = volumeData+10;
        if(volumeData<=100){
          player.volume(volumeData);
        }else{
          volumeData=100;
        }*/
        if(vlcPlayer!=null){
          vlcPlayer.request('/requests/status.json?command=volume&val=+15', function(err){
            if(!err){
              console.log("volumeUp")
            }
          })
        }
        
      }
      if(message == "volumeDown"){
        /*volumeData = volumeData-10;
        if(volumeData>=0){
          player.volume(volumeData);
        }else{
          volumeData=0;
        }*/
        if(vlcPlayer!=null){
          vlcPlayer.request('/requests/status.json?command=volume&val=-15', function(err){
            if(!err){
              console.log("volumeDown")
            }
          })
        }
      }
      if(message == "forward"){
        
        if(vlcPlayer!=null){
          vlcPlayer.request('/requests/status.json?command=seek&val=+15', function(err){
            if(!err){
              console.log("forward")
            }
          })
        }
        
      }
      if(message == "rewind"){
        
        if(vlcPlayer!=null){
          vlcPlayer.request('/requests/status.json?command=seek&val=-15', function(err){
            if(!err){
              console.log("rewind")
            }
          })
        }
        
      }
      if(message == "status"){
        console.log("inside status");
        vlcPlayer.request('/requests/status.json', function(err, data){
          if(!err){
            console.log("status ", data);
          }else{
            console.log("status", err);
          }
        })
      }
      if(message == "close"){
        pyshell.kill();
      }
      if(message == "start"){
        pyshell = new PythonShell('/opt/ElitePy/launcher.py');
      }
      /*child = exec('mplayer -vo -fs x11 /media/pi/TT/efe/movies/kannada/KGF.mkv', function(error, stdout, stderr){
        if(error || stderr){
          console.error(error, stderr);
        }else{
          console.log(stdout);
        }
      })*/
    }
  });
    
  
  
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



module.exports = router;
