define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var StudentModel = Backbone.Model.extend({

  		defaults : {
          name : "student",
          id: null,
          socketId: null,
          iceCandidateInfo: null,
          socketInfo: null
      },  

      initialize: function( options ) {
  			
  		}
		
    });

  	return StudentModel;

});
