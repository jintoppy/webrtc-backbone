define([
  'jquery',
  'underscore',
  'backbone',
  'models/owner/OwnerModel',
  'text!templates/footer/footerTemplate.html'
], function($, _, Backbone, OwnerModel, footerTemplate){

  var FooterView = Backbone.View.extend({
    el: $("#footer"),

    initialize: function() {
      var that = this;
   
      that.model = new OwnerModel({});
      that.render();

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
