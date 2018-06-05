document.addEventListener("DOMContentLoaded", (event) =>
{
  var peer_id;
  var username;
  var conn;

  var peer = new Peer(
  {
    host: "ec2-54-201-9-191.us-west-2.compute.amazonaws.com",
    port: 9000,
    path: '/peerjs',
    debug: 3,
    config: {
      'iceServers' : [
        { url: 'stun:stun.l.google.com:19302' },
        {
          url: 'turn:34.223.214.133:3478',
          username: 'ninefingers',
          credential: 'youhavetoberealistic'
        }
      ]
    }
  });

  peer.on('open', () => 
  {
    document.getElementById('peer-id-label').innerHTML = peer.id;
  });

  peer.on('connection', (connection) => 
  {
    conn = connection;
    peer_id = connection.peer;
    conn.on('data', handleMessage);

    document.getElementById("peer_id").className += " hidden";
    document.getElementById("peer_id").value = peer_id;
    document.getElementById("connected_peer").innerHTML = connection.metadata.username;
  });

  peer.on('error', (err) => 
  {
    alert('An error occured with bud: ' + err);
    console.error(err);
  });

  peer.on("call", (call) => 
  {
    var acceptsCall = confirm("Videocall incoming, do you want to accept it?");

    if(acceptsCall)
    {
      call.answer(window.localStream);

      call.on('stream', (stream) => 
      {
        window.peer_stream = stream;
        onReceiveStream(stream, 'peer-camera');
      });

      call.on('close', () => 
      {
        alert("Videocall has finished!");
      });
    }
    else
    {
      console.log("Call denied!");
    }
  });

  function requestLocalVideo(callback)
  {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    navigator.getUserMedia({audio: true, video: true}, callback.success, callback.error);
  }

  function onReceiveStream(stream, element_id)
  {
    var video = document.getElementById(element_id);
    video.src = window.URL.createObjectURL(stream);
    window.peer_stream = stream;
  }

  function handleMessage(data)
  {
    var orientation = "text_left";
    
    if(data.from == username)
    {
      orientation = "text-right"
    }

    var messageHTML = '<a href="javascript:void(0);" class="list-group-item' + orientation + '">';
    messageHTML += '<h4 class="list-group-item-heading">'+ data.from +'</h4>';
    messageHTML += '<p class="list-group-item-text">'+ data.text +'</p>';
    messageHTML += '</a>';

    document.getElementById("messages").innerHTML += messageHTML;
  }

  document.getElementById("send-message").addEventListener("click", () =>
  {
    var text = document.getElementById("message").value;
    var data = 
    {
        from: username, 
        text: text 
    };
    conn.send(data);
    handleMessage(data);
    document.getElementById("message").value = "";
  }, false);

  document.getElementById("call").addEventListener("click", () =>
  {
    console.log('Calling to ' + peer_id);
    console.log(peer);

    var call = peer.call(peer_id, window.localStream);

    call.on('stream', function (stream) 
    {
        window.peer_stream = stream;
        onReceiveStream(stream, 'peer-camera');
    });
  }, false);

  document.getElementById("connect-to-peer-btn").addEventListener("click", () =>
  {
    username = document.getElementById("name").value;
    peer_id = document.getElementById("peer_id").value;
    
    if (peer_id) 
    {
      conn = peer.connect(peer_id, 
      {
        metadata: { 'username': username }
      });
      conn.on('data', handleMessage);
    }
    else
    {
      alert("You need to provide a peer to connect with !");
      return false;
    }

    document.getElementById("chat").className = "";
    document.getElementById("connection-form").className += " hidden";
  }, false);

  requestLocalVideo(
  {
    success: function(stream)
    {
        window.localStream = stream;
        onReceiveStream(stream, 'my-camera');
    },
    error: function(err)
    {
        alert("Cannot get access to your camera and video !");
        console.error(err);
    }
  });

}, false);
