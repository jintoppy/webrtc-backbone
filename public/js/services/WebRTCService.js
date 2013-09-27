define([
	'domain/MessageBus',
	'services/SocketService'
	],
	function(MessageBus, SocketService) {
    'use strict';

    if (!window.io) {
        return false;
    }
    var localPeerConnection;
    window.RTCPeerConnection  = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
	window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    var sdpConstraints = {'mandatory': {
                      'OfferToReceiveAudio': true,
                      'OfferToReceiveVideo': true }};

	var configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};                      

    function getLocalUserMedia(){
		var constraints = {
			//audio: true, 
			video: {
				mandatory: {
					chromeMediaSource: 'screen'
				}
			}	
		};
		//_getUserMedia(constraints, successCallback, errorCallback);    	
		navigator.getUserMedia(constraints, 
		function(stream){ 
			MessageBus.trigger('onGetLocalUserScreenSuccess', stream); 
		}, 
		function(error){
			MessageBus.trigger('onGetLocalUserScreenError', error);
		}
		);    	
    }

    MessageBus.on('onGetLocalUserScreenSuccess', function(stream){
    	localPeerConnection.addStream(stream);
    }); 

    function createPeerConnection(){
    	
    	localPeerConnection = new RTCPeerConnection(configuration);
    	localPeerConnection.onicecandidate = gotIceCandidate;
    	localPeerConnection.onaddstream = gotStream;
    	console.log('createPeerConnection');

    }

    function createOffer(){
    	console.log('createOffer');
    	localPeerConnection.createOffer(setLocalAndSendMessage, onCreateSessionDescriptionError, sdpConstraints);
    }

    function setLocalAndSendMessage(sessionDescription) {
	  //sessionDescription.sdp = maybePreferAudioReceiveCodec(sessionDescription.sdp);
	  localPeerConnection.setLocalDescription(sessionDescription,
	       onSetSessionDescriptionSuccess, onSetSessionDescriptionError);
	  SocketService.emit('PeerMessage',sessionDescription);
	}

	function onCreateSessionDescriptionError(error){
		console.log('onCreateSessionDescriptionError'+ error.toString());
	}

	function onSetSessionDescriptionSuccess() {
  		console.log('Set session description success.');
	}

	function onSetSessionDescriptionError(error) {
  		console.log('Failed to set session description: ' + error.toString());
	}

    function gotIceCandidate(event){
    	console.log('gotIceCandidate');
    	if(!event.candidate){
    		return;
    	}
    	var candidate = {
    			 type: 'candidate',
                 label: event.candidate.sdpMLineIndex,
                 id: event.candidate.sdpMid,
                 candidate: event.candidate.candidate};

    	SocketService.emit('PeerMessage',candidate);
    }

    function gotStream(event){
    	MessageBus.trigger('onRemoteStreamReceived', event.stream);
    }

    function doAnswer(){
    	localPeerConnection.createAnswer(setLocalAndSendMessage, onCreateSessionDescriptionError, sdpConstraints);
    }

    function addIceCandidate(message){
    	var candidate = new RTCIceCandidate({sdpMLineIndex: message.label,
                                         candidate: message.candidate});
	    localPeerConnection.addIceCandidate(candidate);
    }

    function setRemoteDescription(message){
    	localPeerConnection.setRemoteDescription(new RTCSessionDescription(message), 
    				onSetSessionDescriptionSuccess, onSetSessionDescriptionError);
    }
    
    return {
    	getLocalUserMedia: getLocalUserMedia,
    	addIceCandidate: addIceCandidate,
    	setRemoteDescription: setRemoteDescription,
    	createPeerConnection: createPeerConnection,
    	createOffer: createOffer,
    	doAnswer: doAnswer
    }

});