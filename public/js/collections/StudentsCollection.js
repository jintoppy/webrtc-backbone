define([
  'underscore',
  'backbone',
  'models/StudentModel'
], function(_, Backbone, StudentModel){

  var StudentsCollection = Backbone.Collection.extend({
      
      model: StudentModel,

      initialize : function(models, options) {},
     
  });

  return StudentsCollection;

});