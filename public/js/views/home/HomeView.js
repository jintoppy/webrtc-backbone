define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'views/sidebar/SidebarView',
  'domain/MessageBus',
  'domain/Repository',
  'services/WebRTCService',
  'firebase',
  'text!templates/home/homeTemplate.html'
], function($, _, Backbone, Bootstrap, SidebarView, MessageBus, Repository, WebRTCService, FireBase, homeTemplate){

  var HomeView = Backbone.View.extend({
    el: $("#page"),

    events: {
      'click #acceptStudentBtn': 'onAcceptStudent',
      'keyup #editorwindow textarea': 'onEditorContentChange'
    },

    onEditorContentChange: function(){
      if(Repository.isClassStarted()){
        var editorContent = $('#editorwindow textarea').val();
        Repository.sendClassContent(editorContent);
      }
      
    },

    initialize: function(){
      this.checkForSocketEvents();
      WebRTCService.createPeerConnection();
      MessageBus.on('onQNARemoteStreamReceived', this.gotQNARemoteStream);
      MessageBus.on('qnASessionEnd', this.onQnASessionEnd);
      this.setUpLocalScreenSharing();
      $('#classIdTitle').val("ClassId is "+ Repository.getClassId());

    },

    onQnASessionEnd: function(){
      var qnaScreenVideo = document.querySelector("#qnaScreenVideo");
      qnaScreenVideo.style.display = 'none';
      Repository.endQnASession();
    },

    checkForSocketEvents: function(){

      MessageBus.on("onjoinClassRequestFromStudent", function(data){
          var modal = $('#newStudentRequestModal');
          console.log('it is coming');
          modal.find('.modal-body').html('Student  ' + data.studentname + ' would like to join');
          $('#newStudentRequestModal #classid').val(data.classid);
          $('#newStudentRequestModal #studentname').val(data.studentname);
          modal.modal('show');
      });

      MessageBus.on('editorContentChanged', function(data){
          $('#editorwindow textarea').val(data);
      });

    },

    gotQNARemoteStream: function(stream){
      if(Repository.isTutor()){
          var qnaScreenVideo = document.querySelector("#qnaScreenVideo");
          qnaScreenVideo.style.display = 'block';
          qnaScreenVideo.src = window.URL.createObjectURL(stream);
          qnaScreenVideo.play();        

      }
    },

    onAcceptStudent: function(){
      var classid = $('#newStudentRequestModal #classid').val();
      var studentname = $('#newStudentRequestModal #studentname').val();

      var inputdata = {
        name: studentname,
        classid: classid
      };

      var _firebaseRef = new Firebase('https://haxter.firebaseio.com/newUser');
      _firebaseRef.set(new Date().toTimeString());

      Repository.responseToRequestToJoinFromStudent(true,inputdata);
      
      WebRTCService.createOffer();

      $('#newStudentRequestModal').modal('hide');
    },

    render: function(){
      console.log('home view render')
      $('.menu li').removeClass('active');
      $('.menu li a[href="#"]').parent().addClass('active');
      this.$el.html(homeTemplate);

      var sidebar = document.getElementById('sidebar');
      if(!sidebar){
        var sidebarView = new SidebarView();
        sidebarView.render(); 
      }
      
      
 
    },

    setUpLocalScreenSharing: function(){
      var that = this;
      WebRTCService.getLocalUserMedia();
    },

    errorInGettingLocalStream: function(){
      console.log('not working the getLocalUserMedia');
    }

  });

  return HomeView;
  
});
