define([
  'jquery',
  'underscore',
  'backbone',
  'domain/MessageBus',
  'collections/StudentsCollection',
  'models/StudentModel',
  'domain/Repository',
  'services/WebRTCService',
  'text!templates/sidebar/sidebarTemplate.html'
], function($, _, Backbone, MessageBus, StudentsCollection, StudentModel, Repository, WebRTCService, sidebarTemplate){

  var SidebarView = Backbone.View.extend({
    el: $(".sidebar"),

    events:{
      'click .list-group-item.active': 'answerToQuestionFromStudent'
    },

    initialize: function(){
        this.collection = new StudentsCollection();
        console.log(this.collection);
        this.checkForStudentJoinAnnouncement();
        this.checkForDoubtsFromStudents();
        this.checkForWebRTCEvents();
        this.collection.on('change', this.render);
   },

   answerToQuestionFromStudent: function(){
        $('.list-group-item.active').removeClass('active');
        WebRTCService.createOfferForQnA();
        Repository.setAsAnswerMode(true);
        MessageBus.trigger('qnASessionStarted');
   },

    checkForStudentJoinAnnouncement: function(){
      var that = this
        MessageBus.on('onstudentJoinedAnnouncement', function(data){
          console.log('onstudentJoinedAnnouncement');
          _.each(data.studentsData, function(student){
            var studentModel = new StudentModel({
              name: student.name,
              id: student.id
            });
            that.collection.add(studentModel);
          });
          that.render();
        });
    },

    checkForDoubtsFromStudents: function(){
      MessageBus.on('studentAskingQuestion', function(data){

          var listOfStudentIdElements = $('.list-group-item input[type=hidden]');
          _.each(listOfStudentIdElements, function(studentIdElement){

              var currentElement = $(studentIdElement);
              if(currentElement.val() ===data.studentId){
                 Repository.setCurrentStudentInQnA(data.studentId);
                 currentElement.parent().addClass('active');
              }

          });

      });
    },

    checkForWebRTCEvents: function(){
        MessageBus.on('onGetLocalUserCameraSuccess',this.gotLocalStream);
        MessageBus.on('onGetLocalUserCameraError',this.errorInGettingLocalStream);
        MessageBus.on('onRemoteStreamReceived', this.gotRemoteStream);
        
    },

    gotRemoteStream: function(stream){
      console.log('successcallback');
      var remotevideo = document.querySelector("#tutorVideo");
      remotevideo.src = window.URL.createObjectURL(stream);
      remotevideo.play();
    },

    gotLocalStream: function(stream){
      console.log('successcallback');
      var localvideo = document.querySelector("#localVideo");
      localvideo.src = window.URL.createObjectURL(stream);
      localvideo.play();
    },
        
    render: function(){

      var that = this;

      var data = {
        students: that.collection.toJSON()
      };
      
      console.log("sideview collection is "+ that.collection.toJSON());

      var compiledTemplate = _.template( sidebarTemplate, data );
    
      $(".sidebar").append(compiledTemplate);
    }

  });

  return SidebarView;
  
});
