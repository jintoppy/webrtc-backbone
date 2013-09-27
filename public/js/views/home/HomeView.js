define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'views/sidebar/SidebarView',
  'domain/MessageBus',
  'domain/Repository',
  'services/WebRTCService',
  'text!templates/home/homeTemplate.html'
], function($, _, Backbone, Bootstrap, SidebarView, MessageBus, Repository, WebRTCService, homeTemplate){

  var HomeView = Backbone.View.extend({
    el: $("#page"),

    events: {
      'click #acceptStudentBtn': 'onAcceptStudent',
      'click #callBtn': 'onPeerCall'
    },

    initialize: function(){
      this.checkForSocketEvents();
      this.checkForWebRTCEvents();
      WebRTCService.createPeerConnection();
      this.setUpLocalScreenSharing();
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

    },

    checkForWebRTCEvents: function(){
        MessageBus.on('onGetLocalUserScreenSuccess',this.gotLocalStream);
        MessageBus.on('onGetLocalUserScreenError',this.errorInGettingLocalStream);
        MessageBus.on('onRemoteStreamReceived', this.gotRemoteStream);
    },

    gotRemoteStream: function(stream){
      console.log('successcallback');
      var remotevideo = document.querySelector("#remoteVideo");
      remotevideo.src = window.URL.createObjectURL(stream);
      remotevideo.play();
    },

    onAcceptStudent: function(){
      var classid = $('#newStudentRequestModal #classid').val();
      var studentname = $('#newStudentRequestModal #studentname').val();

      var inputdata = {
        name: studentname,
        classid: classid
      };

      Repository.responseToRequestToJoinFromStudent(true,inputdata);
      WebRTCService.createOffer();

      $('#newStudentRequestModal').modal('hide');
    },

    render: function(){
      
      $('.menu li').removeClass('active');
      $('.menu li a[href="#"]').parent().addClass('active');
      this.$el.html(homeTemplate);

      var sidebarView = new SidebarView();
      sidebarView.render();
 
    },

    onPeerCall: function(){
              // the famous Google STUN server for signaling
      var configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]},
        mediaConstraints = {
            'mandatory': {
                'OfferToReceiveAudio':true, 
                'OfferToReceiveVideo':true
            }
        };
        //WebRTCService.
    },

    setUpLocalScreenSharing: function(){
      var that = this;
      WebRTCService.getLocalUserMedia();
    },

    gotLocalStream: function(stream){
      console.log('successcallback');
      var localvideo = document.querySelector("#localVideo");
      localvideo.src = window.URL.createObjectURL(stream);
      localvideo.play();
    },

    errorInGettingLocalStream: function(){
      console.log('not working the getLocalUserMedia');
    }

  });

  return HomeView;
  
});
