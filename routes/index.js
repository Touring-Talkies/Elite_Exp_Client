const {PythonShell} =require('python-shell');
var express = require('express');
var router = express.Router();
var MPlayer = require('mplayer');
var player = new MPlayer();
var pyshell = new PythonShell('/opt/ElitePy/launcher.py');

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
  if(message == "play"){
    player.setOptions({
      cache: 128,
      cacheMin: 1,
      width:100,
      height:100
    })
    player.openFile('/media/pi/TT/efe/movies/hindi/Dangal.mkv');
    player.on('ready', () => {
      console.log("player is ready ")
      pyshell.kill();
      player.play()
    })
  }
  if(message == "pause"){
    if(player!=null){
      player.on('status', (data) => {
        console.log();
      })
    }
    player.pause()
  }
  if(message == "stop"){
    pyshell = new PythonShell('/opt/ElitePy/launcher.py');
    if(player!=null){
      player.stop()
    }
    
  }
  /*child = exec('mplayer -vo -fs x11 /media/pi/TT/efe/movies/kannada/KGF.mkv', function(error, stdout, stderr){
    if(error || stderr){
      console.error(error, stderr);
    }else{
      console.log(stdout);
    }
  })*/
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



module.exports = router;
