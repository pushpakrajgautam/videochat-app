var fs = require('fs');
var peerServer = require('peer').PeerServer;

var server = peerServer(
{
  port: 9000,
  path: '/peerjs',
  ssl: 
  {
    key: fs.readFileSync('../cert/myCA.key', 'utf-8'),
    cert: fs.readFileSync('../cert/myCA.pem', 'utf-8'),
  }
});
