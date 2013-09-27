define([
  'jquery',
  'backbone',
  'views/home/HomeView',
  'domain/Repository',
  'domain/MessageBus',
  'text!templates/login/loginTemplate.html'
], function($, Backbone, HomeView, Repository, MessageBus, loginTemplate){

  var LoginView = Backbone.View.extend({

    el: $("#page"),

    events:{
      "click #createClassBtn": "triggerCreateClassRequest",
      "click #joinClassBtn": "triggerJoinClassRequest"
    },

    initialize: function(){
      this.listenToClassCreationStatus();
      this.listenToClassJoinStatus();
    },

    triggerCreateClassRequest: function(){
      var classId = $('#txtClassId').val(), name = "Jinto Jose"+ new Date().getTime();
      Repository.createClass(classId, name);
    },

    listenToClassCreationStatus: function(){
      MessageBus.on('classCreationStatusEvent', function(data){
          console.log(data);
          if(data.message === 'success'){
              new HomeView().render();
          }
          else
          {
             alert('already taken');
          }
        
      });
    },

    listenToClassJoinStatus: function(){
      MessageBus.on('onstudentAcceptResponse', function(data){
        console.log('listenToClassJoinStatus');
        if(data.message === 'success'){
          new HomeView().render();
        }
        else
        {
          alert('Sorry. not allowd');
        }
      });
    },

    triggerJoinClassRequest: function(){
      var classId= $('#txtClassId').val(), name = "Jinto Jose"+ new Date().getTime();
      Repository.joinClass(classId, name);
    },

    render: function(){
      this.$el.html(loginTemplate);
    }

  });

  return LoginView;
  
});
