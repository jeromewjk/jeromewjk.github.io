import './main.html';

Events = new Mongo.Collection('event');

Router.route('/register');

Router.route('/login');

Router.route('/listModules');

Router.route('/home');

Router.route('/newEvent');

Router.route('/eventList');

Router.route('/', {
name: 'default',
template: 'default'
});

Router.configure({
    layoutTemplate: 'main',
    loadingTemplate: 'loading'
});

Template.eventList.helpers({
    'searchedEvents' : function() {
        return searchEvents();
    }
});

Template.eventList.onRendered(function() {
     $(".loginButton").removeClass('selected');
     $(".calendarButton").removeClass('selected');
     $(".newEventButton").removeClass('selected');
     $(".moduleListButton").removeClass('selected');
     $(".registerButton").removeClass('selected');
     $(".eventListButton").addClass('selected');
 });

function searchEvents() {
     var list = [];
        for (var i = 0; i < localStorage.length; i++) {
            // console.log('inside for loop');
            if (localStorage.getItem(localStorage.key(i)) == null) {
                continue;
            }
            // console.log(JSON.parse(localStorage.getItem(localStorage.key(i))));
            list = list.concat(JSON.parse(localStorage.getItem(localStorage.key(i))));
        }
        return list;
};

Template.listModules.onRendered(function() {
     $(".loginButton").removeClass('selected');
     $(".calendarButton").removeClass('selected');
     $(".newEventButton").removeClass('selected');
     $(".moduleListButton").addClass('selected');
     $(".registerButton").removeClass('selected');
     $(".eventListButton").removeClass('selected');
 });

Template.listModules.events({
    'submit form' : function(event){
        event.preventDefault();
        var deleteModule = $('[name="deleteModuleEvents"]').val().toUpperCase();
        if(typeof Events.find({module: deleteModule}).fetch()[0] !== 'undefined'){
            $('[name="deleteModuleEvents"]').val("");
            var confirm = window.confirm("Delete all events related to module " + deleteModule + "?");
            if(confirm){
                Events.find({module: deleteModule}).forEach(function(doc){
                    Events.remove({_id: doc._id});
                });
            };
        } else {
            sAlert.warning("No events created for this module.", {timeout: 5000, onRouteClose: true});
        }
    },
    'click .li-listModule' : function(event){
        event.preventDefault();
        var currentId = this._id;
        var content = Events.find({_id: currentId}).fetch();
        console.log(content);
        var print = ("Event title: " + content[0].title +
                     "<br>Module: " + content[0].module +
                     "<br>Date & Time: " + moment(content.startDate).format("Do MMM YY") +
                      ", " + moment(content[0].startDate).format("hh:mm A") + 
                      " to " + moment(content[0].endDate).format("hh:mm A"));
                 if(content[0].description !== ""){
                    print = print + "<br>Description: " + content[0].description;
                 };                    
                 sAlert.warning(print,{effect: 'scale', position: 'top-right', timeout: 'none',onRouteClose: true, stack: true, offset: '80px', html: true});
            },
});

Template.listModules.helpers({
    'item' : function() {
        var currentUser = Meteor.userId();
        var stuff = Events.find(
        {
            createdBy: currentUser,
            startDate: { $gte: new Date() }
        }, {sort: {module:1, startDate:1}}).fetch();
        var displayArray = testing();
        return stuff;
    },
});

function testing(){
    var currentUser = Meteor.userId();
     var array = Events.find(
        {
            createdBy: currentUser,
            startDate: { $gte: new Date() }
        }, {sort: {module:1, startDate:1}}).fetch();

     var finalArr = [];
     var currentArr = [];
     currentArr.push(array[0]);
     for (var i = 1; i < array.length; i++) {
        if(array[i].module == array[i-1].module){
            currentArr.push(array[i])
        } else {
            finalArr.push(currentArr);
            currentArr=[];
            currentArr.push(array[i]);
        }
        if(i+1 == array.length){
            finalArr.push(currentArr);
        }
    };
    // console.log(finalArr);
    return finalArr;
    // document.getElementById("p3").innerHTML = currentArr[0].module;
}



Template.module.events({
    'click .delete-event' : function() {
        event.preventDefault();
        var eventId = this._id;
        var confirm = window.confirm("Delete this Event?");
        if (confirm) {
            Events.remove({ _id: eventId })
        }
    },

    'click .delete-module' : function() {
        event.preventDefault();
        var deletingItem = Events.find({_id: this._id}).fetch();
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            var array = JSON.parse(localStorage.getItem(key));
            for (var j = 0; j < array.length; j++) {
                if (this._id == array[j]._id) {
                    var confirm = window.confirm("Delete this Event?");
                    if (confirm) {
                        array.splice(j, 1);
                        localStorage.setItem(key, array);
                        return;
                    }
                }
            }
        }
    }
});

Template.newEvent.onRendered(function(){
    $(".loginButton").removeClass('selected');
    $(".calendarButton").removeClass('selected');
    $(".newEventButton").addClass('selected');
    $(".moduleListButton").removeClass('selected');
    $(".registerButton").removeClass('selected');
    $(".eventListButton").removeClass('selected');

    $('.newEvent').validate({
        submitHandler : function() {
            var currentUser = Meteor.userId();
            var module = $('[name="module"]').val().toUpperCase();
            var date = event.target.date.value;
            var month = event.target.month.value;
            var year = event.target.year.value;
            var startTime = event.target.startTime.value;
            if(startTime < 10){
                startTime = "0" + startTime;
            }
            var endTime = event.target.endTime.value;
            if(endTime < 10){
                endTime = "0" + endTime;
            }
            var type = document.getElementById("dropList").value;
            var description = event.target.description.value;
            var id = event.target.id.value;
            var error = false;
            var completed = false;
            if (month == 2) {
                if (year%4 == 0 && year%100 != 0 || year%400 == 0) {
                    if (date > 29) {
                        alert("You have entered an invalid date!");
                        error = true;
                        Router.go('newEvent');
                    };
                } else {
                    if (date > 28) {
                        alert("You have entered an invalid date!");
                        error = true;
                        Router.go('newEvent');
                    }
                };
            } else if (month == 2 || month == 4 || month == 6 ||
                month == 9 || month == 11) {
                if (date > 30) {
                    alert("You have entered an invalid date!");
                    error = true;
                    Router.go('newEvent');
                };
            }
            if (!error) {
                Events.insert({
                    id: id,
                    module: module,
                    date: date,
                    month: month,
                    year: year,
                    startTime: startTime,
                    endTime: endTime,

                    type: type,
                    description: description,
                    createdBy: currentUser,
                    startDate: new Date(year, month-1, date, startTime),
                    endDate: new Date(year, month-1, date, endTime),
                    title: module + " " + type,
                    completed: true
                });
                var localList = Events.find({module: module}).fetch();
                localStorage.setItem(module, JSON.stringify(localList));
                var print = ("Event Created!<br>" + 
                    "<br>Module: " + module +
                    "<br>Date: " + date + "/" + month + "/" + year +
                    "<br>From: " + startTime + "00 To: " + endTime + "00" +
                    "<br>Type: " + type +
                    "<br>Description: " + description);
                sAlert.warning(print, {timeout: 7000, onRouteClose: true,html: true, onClose: function(){ 
                    Router.go('home');
                }
            });

            }
        }
    })
});

Template.register.events({
    'submit form' : function() {
        event.preventDefault();
    }
});

Template.navigation.events({
    'click .logout' : function() {
        event.preventDefault();
        Meteor.logout();
        Router.go('login');
    }
});

Template.login.events({
    'submit form' : function() {
        event.preventDefault();
    }
});

Template.login.onRendered(function() {
    $(".loginButton").addClass('selected');
    $(".calendarButton").removeClass('selected');
    $(".newEventButton").removeClass('selected');
    $(".moduleListButton").removeClass('selected');
    $(".registerButton").removeClass('selected');
    $(".eventListButton").removeClass('selected');

    var validator = $('.login').validate({
        submitHandler: function(event) {
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Meteor.loginWithPassword(email, password, function(error) {
                if (error) {
                    if (error.reason == "User not found") {
                        validator.showErrors({
                            email: "That email doesn't belong to a registered user."
                        });
                    }
                    if (error.reason == "Incorrect password") {
                        validator.showErrors({
                            password: "You entered an incorrect password."
                        });
                    }
                } else {
                    var currentRoute = Router.current().route.getName();
                    if (currentRoute == 'login') {
                        Router.go('home');
                    }
                }
            });
        }
    });
});

Template.register.onRendered(function() {
    $(".loginButton").removeClass('selected');
    $(".calendarButton").removeClass('selected');
    $(".newEventButton").removeClass('selected');
    $(".moduleListButton").removeClass('selected');
    $(".registerButton").addClass('selected');
    $(".eventListButton").removeClass('selected');

    var validator = $('.register').validate({
        submitHandler : function(event) {
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Accounts.createUser({
                email: email,
                password: password
            }, function(error) {
                if (error) {
                    if (error.reason == "Email already exists.") {
                        validator.showErrors({
                            email: "That email already belongs to a registered user."
                        });
                    }
                } else {
                    Router.go('home');
                }
            });
        }
    });
});

$.validator.setDefaults({
    rules: {
        email: {
            required: true,
            email: true
        },
        password: {
            minlength: 6
        },
        startTime: {
            digits: true,
            max: 23,
            min: 00
        },
        endTime: {
            digits: true,
            max: 23,
            min: 00
        },
        month: {
            min: 1,
            max: 12
        },
        date: {
            min: 1,
            max: 31
        }
    },
    messages: {
        email: {
            required: "You must enter an email address.",
            email: "You've entered an invalid email address."
        },
        password: {
            required: "You must enter a password.",
            minlength: "Your password must be at least {0} characters."
        },
        startTime: {
            max: "You must enter a number from 0 to 23",
            min: "You must enter a number from 0 to 23"
        },
        endTime: {
            max: "You must enter a number from 0 to 23",
            min: "You must enter a number from 0 to 23"
        },
        date: {
            max: "You must enter a number from 1 to 31",
            min: "You must enter a number from 1 to 31"
        },
        month: {
            max: "You must enter a number from 1 to 12",
            min: "You must enter a number from 1 to 12"
        }
    }
});

Template.calendar.events({
        'submit form': function(event){
            event.preventDefault();
            var searchModule = $('[name="searchModule"]').val();
            searchModule = searchModule.toUpperCase();
            var count = 0;
            Events.find({module: searchModule}).forEach(function(doc){
                // console.log("found");
                count++;
            });
            if(count==0){
                if(searchModule == ""){
                    sAlert.warning("No module code entered.", {timeout: 5000, onRouteClose: true, stack: { limit: 1}});
                } else {
                sAlert.warning("No schedules for module " + searchModule +".", {timeout: 5000, onRouteClose: true, stack: { limit: 1}});
                $('[name="searchModule"]').val('');
                return;
            }
        }
            $('[name="searchModule"]').val('');

            var localList = Events.find({module: searchModule}).fetch();
            if(localStorage.getItem(searchModule)!== null){
                return;
            }
            localStorage.setItem(searchModule, JSON.stringify(localList));
            var array = Events.find({module:searchModule}).fetch();

            var newArr = [];
            for (i = 0; i < array.length; i++) {

                    //set date colour
                var todayDate = new Date();
                var currentDate = array[i].startDate;
                var day = 1000*60*60*24;
                var diff = Math.ceil((todayDate.getTime()-currentDate.getTime())/(day));
                var color1;
                if(diff > 0){
                    color1 = "#011f4b";
                } else if (diff<-6){
                    color1 = "#0099ff";
                } else if (diff < -2){
                    color1 = "#6aa87b";
                } else {
                    color1 = "#fd254f";

                    var print = array[i].title;
                    if(array[i].type == "Quiz" || array[i].type == "Assignment"){
                        print += "<br>Due on: " + moment(array[i].startDate).format("Do MMM YY") +
                        ", " + moment(array[i].startDate).format("hh:mm A");
                      } else {
                        print += "<br>Happening on: " + moment(array[i].startDate).format("Do MMM YY") +
                        ", " + moment(array[i].startDate).format("hh:mm A");
                    }
                    sAlert.info(print,{effect: 'genie', position: 'bottom-right',
                    timeout: 8000, onRouteClose: true, stack: true, offset: '10px', html:true});
                }

                $('#calendarDiv').fullCalendar('renderEvent', {
                    id: i,
                    title: array[i].title,
                    module: array[i].module,
                    start: array[i].startDate,
                    end: array[i].endDate,
                    type: array[i].type,
                    description: array[i].description,
                    createdBy: array[i].createdBy,
                    completed: array[i].completed,
                    color: color1,
                }, true);
            }
            console.log("Success!");
        }
    });

function SearchAndParse (moduleName) {
    var newArr=[];
    var keyCount = 0;
    for (keyCount = 0; keyCount < localStorage.length; keyCount++){

        var moduleSearch = localStorage.key(keyCount);
        var array = Events.find({module: moduleSearch}).fetch();

        for (i = 0; i < array.length; i++) {
            var currentDate = array[i].startDate;
            var todayDate = new Date();
            var day = 1000*60*60*24;
            var diff = Math.ceil((todayDate.getTime()-currentDate.getTime())/(day));
            var color1;

            if(diff > 0){
                color1 = "#011f4b";
            } else if (diff<-6){
                color1 = "#0099ff";
            } else if (diff < -2){
                color1 = "#6aa87b";
            } else {
                color1 = "#fd254f";

                var print = array[i].title;
                if(array[i].type == "Quiz" || array[i].type == "Assignment"){
                    print += "<br>Due on: " + moment(array[i].startDate).format("Do MMM YY") +
                    ", " + moment(array[i].startDate).format("hh:mm A");
                } else {
                    print += "<br>Happening on: " + moment(array[i].startDate).format("Do MMM YY") +
                    ", " + moment(array[i].startDate).format("hh:mm A");
                }
                sAlert.info(print,{effect: 'genie', position: 'bottom-right',
                    timeout: 8000, onRouteClose: true, stack: true, offset: '10px', html:true});
            }
            var tempObj = {
                id: i,
                title: array[i].title,
                module: array[i].module,
                start: array[i].startDate,
                end: array[i].endDate,
                type: array[i].type,
                description: array[i].description,
                createdBy: array[i].createdBy,
                completed: array[i].completed,
                color: color1
            }
            newArr.push(tempObj);
        }
    };

    if(Meteor.userId() !== null){
        var currentUser = Meteor.userId();
        var array = Events.find({createdBy: currentUser}).fetch();
        var i;
        var j;
        for(i = 0; i < array.length; i++){
            if(localStorage.getItem(array[i].module)!== null){
                break;
            } else {
                var currentDate = array[i].startDate;
                var todayDate = new Date();
                var day = 1000*60*60*24;
                var diff = Math.ceil((todayDate.getTime()-currentDate.getTime())/(day));
                var color1;

            if(diff > 0){
                color1 = "#011f4b";
            } else if (diff<-6){
                color1 = "#0099ff";
            } else if (diff < -2){
                color1 = "#6aa87b";
            } else {
                color1 = "#fd254f";

                var print = array[i].title;
                if(array[i].type == "Quiz" || array[i].type == "Assignment"){
                    print += "<br>Due on: " + moment(array[i].startDate).format("Do MMM YY") +
                    ", " + moment(array[i].startDate).format("hh:mm A");
                } else {
                    print += "<br>Happening on: " + moment(array[i].startDate).format("Do MMM YY") +
                    ", " + moment(array[i].startDate).format("hh:mm A");
                }
                sAlert.info(print,{effect: 'genie', position: 'bottom-right',
                    timeout: 8000, onRouteClose: true, stack: true, offset: '10px', html:true});
            }
            var tempObj = {
                id: i,
                title: array[i].title,
                module: array[i].module,
                start: array[i].startDate,
                end: array[i].endDate,
                type: array[i].type,
                description: array[i].description,
                createdBy: array[i].createdBy,
                completed: array[i].completed,
                color: color1
            }
            newArr.push(tempObj);
            }
    }
};



    $('#calendarDiv').fullCalendar({
        header: {
            left: 'agendaDay, agendaWeek, month',
            center: 'title',
            right: 'today prev,next'
        },
        slotDuration: '00:30:00',
        editable: false,
        events: newArr,
           eventClick: function(event) {
                 var print = ("Event title: " + event.title +
                     "<br>Module: " + event.module +
                     "<br>Date & Time: " + moment(event.start).format("Do MMM YY") +
                      ", " + moment(event.start).format("hh:mm A") + 
                      " to " + moment(event.end).format("hh:mm A"));
                 if(event.description !== ""){
                    print = print + "<br>Description: " + event.description;
                 };                    
                 sAlert.warning(print,{effect: 'scale', position: 'top-right', timeout: 'none',onRouteClose: true, stack: true, offset: '80px', html: true});
            },
        });
     }

     Template.calendar.onRendered(function() {
     $(".loginButton").removeClass('selected');
     $(".calendarButton").addClass('selected');
     $(".newEventButton").removeClass('selected');
     $(".moduleListButton").removeClass('selected');
     $(".registerButton").removeClass('selected');
     $(".eventListButton").removeClass('selected');
 });
     Template.calendar.onRendered(() => SearchAndParse(""));
