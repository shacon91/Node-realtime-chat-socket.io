'use strict';

window.addEventListener('load',function(){
	var localVideo = document.getElementById('local'),
		remoteVideo = document.getElementById('remote'),
		startButton = document.getElementById('start'),
		callButton = document.getElementById('call'),
		hangupButton = document.getElementById('hangUp'),
		startTime;
	
	callButton.disabled = true;
	hangupButton.disabled = true;
	startButton.onclick = start;
	callButton.onclick = call;
	hangupButton.onclick = hangup;



var localStream;
var pc1;
var pc2;




function gotStream(stream) {

  trace('Received local stream');

  localVideo.srcObject = stream;

  // Add localStream to global scope so it's accessible from the browser console
  window.localStream = localStream = stream;

  callButton.disabled = false;
}

function start() {
  trace('Requesting local stream');

  startButton.disabled = true;

  //instead of putting in 1 object and 2 callbacks used a promise
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true
  })

  .then(gotStream)

  .catch(function(e) {
    alert('getUserMedia() error: ' + e.name);
  });
}





var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};


function call() {

  callButton.disabled = true;
  hangupButton.disabled = false;

  trace('Starting call');

  
  would need to set up ICE server here
  var servers = null;



/*---------------ON ICE CANDIDATE-----------*/

// onicecandidate - called when network candidates become available.


  // Add pc1 to global scope so it's accessible from the browser console
  window.pc1 = pc1 = new RTCPeerConnection(servers);
  trace('Created local peer connection object pc1');
  pc1.onicecandidate = function(e) {
    onIceCandidate(pc1, e);
  };
  // Add pc2 to global scope so it's accessible from the browser console
  window.pc2 = pc2 = new RTCPeerConnection(servers);
  trace('Created remote peer connection object pc2');
  pc2.onicecandidate = function(e) {
    onIceCandidate(pc2, e);
  };





  pc1.oniceconnectionstatechange = function(e) {
    onIceStateChange(pc1, e);
  };
  pc2.oniceconnectionstatechange = function(e) {
    onIceStateChange(pc2, e);
  };

  //PUTS REMOTE VIDEO SRC ON VID
  pc2.onaddstream = gotRemoteStream;

   //PUTS LOCAL VIDEO SRC ON VID
  pc1.addStream(localStream);
  trace('Added local stream to pc1');




  trace('pc1 createOffer start');
  pc1.createOffer(
    offerOptions
  ).then(
    onCreateOfferSuccess,
    onCreateSessionDescriptionError
  );
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function onCreateOfferSuccess(desc) {
  trace('Offer from pc1\n' + desc.sdp);
  trace('pc1 setLocalDescription start');
  pc1.setLocalDescription(desc).then(
    function() {
      onSetLocalSuccess(pc1);
    },
    onSetSessionDescriptionError
  );
  trace('pc2 setRemoteDescription start');
  pc2.setRemoteDescription(desc).then(
    function() {
      onSetRemoteSuccess(pc2);
    },
    onSetSessionDescriptionError
  );
  trace('pc2 createAnswer start');
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  pc2.createAnswer().then(
    onCreateAnswerSuccess,
    onCreateSessionDescriptionError
  );
}

/* ------------ Error handling  ----------------*/

function getName(pc) {
  return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}

function onSetLocalSuccess(pc) {
  trace(getName(pc) + ' setLocalDescription complete');
}

function onSetRemoteSuccess(pc) {
  trace(getName(pc) + ' setRemoteDescription complete');
}

function onSetSessionDescriptionError(error) {
  trace('Failed to set session description: ' + error.toString());
}

function gotRemoteStream(e) {
  // Add remoteStream to global scope so it's accessible from the browser console
  window.remoteStream = remoteVideo.srcObject = e.stream;
  trace('pc2 received remote stream');
}

function onCreateAnswerSuccess(desc) {
  trace('Answer from pc2:\n' + desc.sdp);
  trace('pc2 setLocalDescription start');
  pc2.setLocalDescription(desc).then(
    function() {
      onSetLocalSuccess(pc2);
    },
    onSetSessionDescriptionError
  );
  trace('pc1 setRemoteDescription start');
  pc1.setRemoteDescription(desc).then(
    function() {
      onSetRemoteSuccess(pc1);
    },
    onSetSessionDescriptionError
  );
}

function onIceCandidate(pc, event) {
  if (event.candidate) {
    getOtherPc(pc).addIceCandidate(
      new RTCIceCandidate(event.candidate)
    ).then(
      function() {
        onAddIceCandidateSuccess(pc);
      },
      function(err) {
        onAddIceCandidateError(pc, err);
      }
    );
    trace(getName(pc) + ' ICE candidate: \n' + event.candidate.candidate);
  }
}

function onAddIceCandidateSuccess(pc) {
  trace(getName(pc) + ' addIceCandidate success');
}

function onAddIceCandidateError(pc, error) {
  trace(getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
}

function onIceStateChange(pc, event) {
  if (pc) {
    trace(getName(pc) + ' ICE state: ' + pc.iceConnectionState);
    console.log('ICE state change event: ', event);
  }
}




function hangup() {
  trace('Ending call');
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
}



//not needed
function trace(text) {
  if (text[text.length - 1] === '\n') {
    text = text.substring(0, text.length - 1);
  }
  if (window.performance) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ' + text);
  } else {
    console.log(text);
  }
}


});

