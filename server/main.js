//import { Meteor } from 'meteor/meteor';
Events = new Mongo.Collection('event');
Meteor.startup(() => {
  // code to run on server at startup
  Meteor.publish('event', function(){
  	var currentUser = this.userId;
  	return Lists.find({createdBy: currentUser});
  });
});
