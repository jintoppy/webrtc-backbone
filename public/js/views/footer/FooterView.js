define([
  'jquery',
  'underscore',
  'backbone',
  'models/owner/OwnerModel',
  'domain/MessageBus',
  'domain/Repository',
  'services/WebRTCService',
  'text!templates/footer/footerTemplate.html'
], function($, _, Backbone, OwnerModel, MessageBus, Repository, WebRTCService, footerTemplate){

  var FooterView = Backbone.View.extend({
    el: $("#footer"),

    events: {
      'click #startClassBtn': 'startClass',
      'click #askQuestionBtn': 'askQuestion',
      'click #endQnABtn': 'endQnASession',
      'click #endClassBtn': 'endClass'
    },

    startClass: function(){
      var editorContent = $('#editorwindow textarea').val();
      Repository.startClass(editorContent);
      var startClassBtn = document.getElementById('startClassBtn');
      startClassBtn.disabled = true;
      var endClassBtn = document.getElementById('endClassBtn');
      endClassBtn.disabled = false;
    },

    endQnASession: function(){
      WebRTCService.endQnASession();
      Repository.endQnASession();
      MessageBus.trigger('qnASessionEnd');
    },

    endClass: function(){
      WebRTCService.endAllConnections();
      MessageBus.trigger('classEnd');
      window.location.reload();
    },

    askQuestion: function(){
      Repository.askQuestion('student1');
      Repository.setQuestionAsked();
      WebRTCService.getStudentScreen();
    },

    initialize: function() {
      var that = this;
      this.setTutorSpecificActions();
      this.setStudentSpecifiActions();
      that.model = new OwnerModel({});
      that.render();
    },

    setTutorSpecificActions: function(){

      MessageBus.on("classCreated", function(){
        console.log('classCreated');

        if(Repository.isTutor()){
          var tutorActions = document.getElementById('tutorActions');
          tutorActions.style.display = 'block';
        }

      });

      MessageBus.on('qnASessionStarted',function(){
        var endQnABtn = document.getElementById('endQnABtn');
        endQnABtn.style.display = 'block';
      });

    },

    setStudentSpecifiActions: function(){
        MessageBus.on("classStarted", function(){
        console.log('classStarted');

        if(!Repository.isTutor() && Repository.isClassStarted()){
          var studentActions = document.getElementById('studentActions');
          studentActions.style.display = 'block';
        }

      });

    },

    render: function(){

      var data = {
        owner: this.model.toJSON()
      };

      var compiledTemplate = _.template( footerTemplate, data );
      this.$el.html(compiledTemplate);
    }

  });

  return FooterView;
  
});
