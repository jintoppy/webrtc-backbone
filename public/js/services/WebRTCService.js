define([
	'domain/MessageBus',
	'services/SocketService',
    'domain/Repository'
	],
	function(MessageBus, SocketService, Repository) {
    'use strict';

    if (!window.io) {
        return false;
    }
    var localPeerConnection;
    var localPeerConnectionForScreen;
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
            video: true,
			audio: true	
		};
		//_getUserMedia(constraints, successCallback, errorCallback);    	
		navigator.getUserMedia(constraints, 
		function(stream){ 
			MessageBus.trigger('onGetLocalUserCameraSuccess', stream); 
		}, 
		function(error){
			MessageBus.trigger('onGetLocalUserCameraError', error);
		}
		);    	
    }

    function getStudentScreen(){
        var constraints = {
            /*video: true*/
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

    MessageBus.on('onGetLocalUserCameraSuccess', function(stream){

    	localPeerConnection.addStream(stream);
    }); 

    MessageBus.on('onGetLocalUserScreenSuccess', function(stream){
        
        createQuestionAnswerConnection();
        localPeerConnectionForScreen.addStream(stream);
    }); 

    function createQuestionAnswerConnection(){
        localPeerConnectionForScreen = new RTCPeerConnection(configuration);
        localPeerConnectionForScreen.onicecandidate = gotIceCandidateForQuestionAnswerConnection;
        localPeerConnectionForScreen.onaddstream = gotStreamForQuestionAnswerConnection;
        console.log('createPeerConnection');        
    }

    function setRemoteDescriptionForQnA(message){
        localPeerConnectionForScreen.setRemoteDescription(new RTCSessionDescription(message), 
                    onSetSessionDescriptionSuccess, onSetSessionDescriptionError);
    }

    function gotIceCandidateForQuestionAnswerConnection(event){
        console.log('gotIceCandidateForQuestionAnswerConnection');
        if(!event.candidate){
            return;
        }
        var candidate = {
                 type: 'candidate',
                 label: event.candidate.sdpMLineIndex,
                 id: event.candidate.sdpMid,
                 candidate: event.candidate.candidate};

        SocketService.emit('QNAPeerMessage',candidate);
    }

    function gotStreamForQuestionAnswerConnection(){
        MessageBus.trigger('onQNARemoteStreamReceived', event.stream);
    }

    function setLocalAndSendMessageForQnA(sessionDescription) {
      //sessionDescription.sdp = maybePreferAudioReceiveCodec(sessionDescription.sdp);
      localPeerConnectionForScreen.setLocalDescription(sessionDescription,
           onSetSessionDescriptionSuccess, onSetSessionDescriptionError);
      SocketService.emit('QNAPeerMessage',sessionDescription);
    }

    function doAnswerForQnA(){
        localPeerConnectionForScreen.createAnswer(setLocalAndSendMessageForQnA, onCreateSessionDescriptionError, sdpConstraints);
    }

    function createOfferForQnA(){
        console.log('createOffer');
        createQuestionAnswerConnection();
        localPeerConnectionForScreen.createOffer(setLocalAndSendMessageForQnA, onCreateSessionDescriptionError, sdpConstraints);
    }

    function addIceCandidateForQnA(message){
        var candidate = new RTCIceCandidate({sdpMLineIndex: message.label,
                                         candidate: message.candidate});
        localPeerConnectionForScreen.addIceCandidate(candidate);
    }    

    function createPeerConnection(){
    	
    	localPeerConnection = new RTCPeerConnection(configuration);
    	localPeerConnection.onicecandidate = gotIceCandidate;
    	localPeerConnection.onaddstream = gotStream;
    	console.log('createPeerConnection');

    }

    function endAllConnections(){
        if(localPeerConnection){
            localPeerConnection.close();
            localPeerConnection = null;
        }
        if(localPeerConnectionForScreen){
            localPeerConnectionForScreen.close();
            localPeerConnectionForScreen = null;
        }
        
    }

    function endQnASession(){
        if(localPeerConnectionForScreen){
            localPeerConnectionForScreen.close();
            localPeerConnectionForScreen = null;            
        }
        
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
        getStudentScreen: getStudentScreen,
    	addIceCandidate: addIceCandidate,
    	setRemoteDescription: setRemoteDescription,
    	createPeerConnection: createPeerConnection,
    	createOffer: createOffer,
    	doAnswer: doAnswer,
        doAnswerForQnA: doAnswerForQnA,
        createOfferForQnA: createOfferForQnA,
        setRemoteDescriptionForQnA: setRemoteDescriptionForQnA,
        addIceCandidateForQnA: addIceCandidateForQnA,
        endAllConnections: endAllConnections,
        endQnASession: endQnASession
    }

});