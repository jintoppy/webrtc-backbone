var express = require('express');
var https =  require('https');

var _ =  require('underscore');

var fs = require('fs');

 var options = {
 	key: fs.readFileSync('key.pem'),
 	cert: fs.readFileSync('cert.pem')
 }


var app = express();

app.use(express.static('./public'));

app.use(express.bodyParser());

var port = process.env.PORT || 3800;

var io = require('socket.io').listen(https.createServer(options, app).listen(port));




var tutors={};
	var students={};
	var studentsInWaiting={};
	var test='';

io.sockets.on('connection', function(socket){
	//console.log('current sockets are '+ io.sockets.clients());
	var clients = io.sockets.clients();

	var roomglobal = null;

	socket.on('PeerMessage', function(data){
		console.log('rtcmessage is ' + data);
		socket.broadcast.emit('PeerMessageFromSocket', data);
	});

	socket.on('joinClassRequest', function(data){
		if(tutors[data.classid]){
			var tutorsocket = tutors[data.classid].socketInfo;
			tutorsocket.emit('joinClassRequestFromStudent', {classid: data.classid, studentname: data.name});
			if(studentsInWaiting[data.classid]){
				studentsInWaiting[data.classid].push({name: data.name, socketInfo: socket, classid: data.classid, id: socket.id });
			}
			else{
				var newStudentsInWaitingArray= [];
				newStudentsInWaitingArray[0] = {name: data.name, socketInfo: socket, classid: data.classid, id: socket.id };
				studentsInWaiting[data.classid] = newStudentsInWaitingArray;
			}
		}
		
	});

	socket.on('studentAccept', function(data){
		if(data.accept)	{
			var studentsInWaitingForThisClass = studentsInWaiting[data.classid];
			var student = _.where(studentsInWaitingForThisClass, {name: data.studentname});
			if(student.length>0){
				var studentSocket = student[0].socketInfo;
				studentSocket.emit('studentAcceptResponse', {message: 'success', classid: data.classid});
				studentSocket.join(data.classid);
					if(students[data.classid])
					{
						students[data.classid].push({name: data.studentname, socketInfo: studentSocket, id: studentSocket.id });	
					}
					else
					{
						var newStudentArray = [];
						newStudentArray[0] =  {name: data.studentname, socketInfo: studentSocket, id: studentSocket.id};
						students[data.classid] = newStudentArray;	
					}
				var studentsList = students[data.classid];
				var studentsdataArr = [];
				for(var i=0;i<studentsList.length; i++){
					studentsdataArr.push(_.omit(studentsList[i], 'socketInfo'));
				}
				console.log('next is studentJoinedAnnouncement' + studentsdataArr);
				io.sockets.in(data.classid).emit('studentJoinedAnnouncement', {studentsData: studentsdataArr});
				roomglobal = data.classid;
			}
			
		}
	});


	socket.on('createClassrequest',function(data){
		if(tutors[data.classid])
		{
			socket.emit('createclass_status', {message: 'This id is already taken. Try some other id', classid: null});	
			return;
		}
		socket.join(data.classid);
		tutors[data.classid] = {name: data.name, socketInfo: socket};
		test = 'Good';
		socket.emit('createclass_status', {message: 'success', classid: data.classid});
	});

	socket.emit('message', {message: 'Welcome to the chat'});
	socket.on('send',function(data){
		io.sockets.in(roomglobal).emit('message',data);
	});



});
