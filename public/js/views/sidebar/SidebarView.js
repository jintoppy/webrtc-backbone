define([
  'jquery',
  'underscore',
  'backbone',
  'domain/MessageBus',
  'collections/StudentsCollection',
  'models/StudentModel',
  'text!templates/sidebar/sidebarTemplate.html'
], function($, _, Backbone, MessageBus, StudentsCollection, StudentModel, sidebarTemplate){

  var SidebarView = Backbone.View.extend({
    el: $(".sidebar"),

    initialize: function(){
        this.collection = new StudentsCollection();
        console.log(this.collection);
        this.checkForStudentJoinAnnouncement();
        this.collection.on('change', this.render);
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
