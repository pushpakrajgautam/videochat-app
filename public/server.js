var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var os = require('os');
var ifaces = os.networkInterfaces();
var express = require('express');
var app = express();

var privateKey = fs.readFileSync('../cert/myCA.key', 'utf-8');
var certificate = fs.readFileSync('../cert/myCA.pem', 'utf-8');

var credentials = {key: privateKey, cert: certificate, passphrase: 'hello'};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

Object.keys(ifaces).forEach((ifname) =>
{
    var alias = 0;

    ifaces[ifname].forEach((iface) => 
    {
        if (iface.family !== 'IPv4' || iface.internal !== false) 
        {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
        }
        
        console.log("Welcome to prgzz Chat");
        console.log("Test the chat interface from this device at : ", "https://localhost:8443");
        console.log("And access the chat sandbox from another device through LAN using any of the IPS:");
        console.log("Important: Node.js needs to accept inbound connections through the Host Firewall");

        if (alias >= 1) 
        {
            console.log("Multiple ipv4 addreses were found ... ");
            // this single interface has multiple ipv4 addresses
            console.log(ifname + ':' + alias, "https://"+ iface.address + ":8443");
        } else {
            // this interface has only one ipv4 adress
            console.log(ifname, "https://"+ iface.address + ":8443");
        }

        alias++;
    });
});

var LANaccess = "0.0.0.0";
httpServer.listen(8080, LANaccess);
httpsServer.listen(8443, LANaccess);

app.get('/', (req, res) => 
{
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.use('/res', express.static('./res'));
