define([
	'services/SocketService',
	'services/WebRTCService',
	'domain/MessageBus'
	],function(SocketSerice, WebRTCService, MessageBus){

	SocketSerice.on('createclass_status',function(data){
		console.log('createclass_status');
		MessageBus.trigger('classCreationStatusEvent', data);
	});

	SocketSerice.on('joinClassRequestFromStudent',function(data){
		MessageBus.trigger('onjoinClassRequestFromStudent', data);
	});

	SocketSerice.on('studentAcceptResponse',function(data){
		MessageBus.trigger('onstudentAcceptResponse', data);
	});

	SocketSerice.on('studentJoinedAnnouncement',function(data){
		MessageBus.trigger('onstudentJoinedAnnouncement', data);
	});

	SocketSerice.on('PeerMessageFromSocket',function(message){
		console.log(message.type);
		console.log(message);
			switch(message.type){
				case 'offer':
					WebRTCService.setRemoteDescription(message);
					WebRTCService.doAnswer();
					break;
					
				case 'answer':
					WebRTCService.setRemoteDescription(message);
					break;

				case 'candidate':
					WebRTCService.addIceCandidate(message)
					break;

			}
	});



	function createClass(classId, name){
		var tutorData = {
			classid: classId,
			name: name
		};
		console.log('createClass in repository');
		SocketSerice.emit('createClassrequest', tutorData);
	}

	function joinClass(classId, name){
		var studentData = {
			classid: classId,
			name: name
		};
		console.log(studentData);
		SocketSerice.emit('joinClassRequest', studentData);
	}

	function responseToRequestToJoinFromStudent(status, studentData){
		var inputdata = {
	        accept: status,
	        studentname: studentData.name,
	        classid: studentData.classid
      	};

      	SocketSerice.emit('studentAccept',inputdata);



	}

	return {
		createClass: createClass,
		joinClass: joinClass,
		responseToRequestToJoinFromStudent: responseToRequestToJoinFromStudent
	};


});