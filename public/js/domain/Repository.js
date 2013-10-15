define([
	'services/SocketService',
	'services/WebRTCService',
	'domain/MessageBus'
	],function(SocketSerice, WebRTCService, MessageBus){

	var isUserTutor = false;
	var classStarted = false;
	var classid = null;
	var personName = ';'
	var isAQuestionAsked = false;
	var isInAnswerMode = false;
	var currentStudentIdInQnA=null;

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

	SocketSerice.on('editorContentChanged',function(data){
		console.log('classStarted');
		if(!classStarted){
			classStarted = true;
			MessageBus.trigger('classStarted');
		}
		MessageBus.trigger('editorContentChanged', data);
	});

	SocketSerice.on('studentAskingQuestion', function(data){
		MessageBus.trigger('studentAskingQuestion', data);
	});

	SocketSerice.on('qnASessionEnded', function(data){
		WebRTCService.endQnASession();
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

	SocketSerice.on('QNAPeerMessageFromSocket',function(message){
		console.log(message.type);

		console.log(message);
		if(isAQuestionAsked || isInAnswerMode){
			switch(message.type){
				case 'offer':
					WebRTCService.setRemoteDescriptionForQnA(message);
					WebRTCService.doAnswerForQnA();
					break;
					
				case 'answer':
					WebRTCService.setRemoteDescriptionForQnA(message);
					break;

				case 'candidate':
					WebRTCService.addIceCandidateForQnA(message)
					break;

			}

		}

	});

	function questionAsked(){
		return isAQuestionAsked;
	}

	function setQuestionAsked(){
		isAQuestionAsked = true;
	}

	function getClassId(){
		return classid;
	}

	function checkAnswerMode(){
		return isInAnswerMode;	
	}

	function setCurrentStudentInQnA(studentId){
		currentStudentIdInQnA= studentId;
	}

	function getCurrentStudentInQnA(){
		return currentStudentIdInQnA;
	}

	function setAsAnswerMode(status){
		isInAnswerMode = true;
	}

	function startClass(editorContent){
		var classdata = {
			classid: classid,
			editorContent: editorContent
		};
		SocketSerice.emit('sendClassData', classdata);
		classStarted = true;
	}

	function sendClassContent(editorContent){
		var classdata = {
			classid: classid,
			editorContent: editorContent
		};
		SocketSerice.emit('sendClassData', classdata);
	}

	function createClass(classId, name){

		var tutorData = {
			classid: classId,
			name: name
		};
		classid = classid;
		console.log('createClass in repository');
		SocketSerice.emit('createClassrequest', tutorData);
	}

	function joinClass(classId, name){
		var studentData = {
			classid: classId,
			name: name
		};
		classid = classId;
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

	function isTutor(){
		return isUserTutor;
	}

	function setAsTutor(){
		isUserTutor = true;
	}

	function isClassStarted(){
		return classStarted;
	}

	function endQnASession(){
		var studentData = {
			classid: classId,
			id: getCurrentStudentInQnA()
		};
		setCurrentStudentInQnA(null);
		SocketSerice.emit('endQnASession', studentData);
	}

	function askQuestion(studentName){
		var inputdata = {
			classid: classid,
			name: studentName
		}
		SocketSerice.emit('studentQuestion',inputdata);
	}

	return {
		createClass: createClass,
		getClassId: getClassId,
		joinClass: joinClass,
		responseToRequestToJoinFromStudent: responseToRequestToJoinFromStudent,
		isTutor: isTutor,
		setAsTutor: setAsTutor,
		startClass: startClass,
		sendClassContent: sendClassContent,
		isClassStarted: isClassStarted,
		askQuestion: askQuestion,
		questionAsked: questionAsked,
		setQuestionAsked: setQuestionAsked,
		checkAnswerMode: checkAnswerMode,
		setAsAnswerMode: setAsAnswerMode,
		endQnASession: endQnASession,
		getCurrentStudentInQnA: getCurrentStudentInQnA,
		setCurrentStudentInQnA: setCurrentStudentInQnA
	};


});