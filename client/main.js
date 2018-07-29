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
        console.log('before function');
        return searchEvents();
    }
//
//        var list = [];
//        for (var i = 0; i < localStorage.length; i++) {
//            if (localStorage.getItem(localStorage.key(i)) == null) {
//                break;
//            }
//            list = list.concat(JSON.parse(localStorage.getItem(localStorage.key(i))));
//        }
//        return list;
//    }
});

function searchEvents() {
    // console.log('searchEvents called');
     var list = [];
        for (var i = 0; i < localStorage.length; i++) {
            // console.log('inside for loop');
            if (localStorage.getItem(localStorage.key(i)) == null) {
                continue;
            }
            // console.log(JSON.parse(localStorage.getItem(localStorage.key(i))));
            list = list.concat(JSON.parse(localStorage.getItem(localStorage.key(i))));
        }
//        localStorage.clear();
//        console.log('localStorage cleared');
        return list;
};

Template.listModules.helpers({
    'item' : function() {
        //event.preventDefault();
        var currentUser = Meteor.userId();
        var stuff = Events.find(
        {
            createdBy: currentUser,
            startDate: { $gte: new Date() }
        }).fetch();
        // console.log(stuff);
        return stuff;
    },

    'checked' : function() {
        var isCompleted = this.completed;
        if (isCompleted) {
            return "checked";
        } else {
            return "";
        }
    }
});

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
                        // console.log('module deleted');
                        console.log(array);
                        return;
                    }
                }
            }
        }
    }
});

Template.newEvent.onRendered(function(){
    $('.newEvent').validate({
        submitHandler : function() {
            var currentUser = Meteor.userId();
            var module = $('[name="module"]').val();
            var date = event.target.date.value;
            var month = event.target.month.value;
            var year = event.target.year.value;
            var startTime = event.target.startTime.value;
            var endTime = event.target.endTime.value;
            // var type = event.target.type.value;
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
                    module: module.toUpperCase(),
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
                var print = ("Event Created!\n" +
                    "Module: " + module + "\n" +
                    "Date: " + date + "/" + month + "/" + year + "\n" +
                    "From: " + startTime + "00 To: " + endTime + "00\n" +
                    "Type: " + type + "\n" +
                    "Description: " + description);
                alert(print);
                Router.go('home');
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
        // startTime: {
        //     digits: true,
        //     max: 23,
        //     min: 00
        // },
        // endTime: {
        //     digits: true,
        //     max: 23,
        //     min: 00
        // },
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
                sAlert.warning("No schedules for module " + searchModule +".", {timeout: 5000, onRouteClose: true});
                $('[name="searchModule"]').val('');
                return;
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
                    sAlert.success(array[i].title + "\n due on : " + array[i].date +"/"+ array[i].month+"/" + array[i]. year,
                     {effect: 'genie', position: 'bottom-right',
                      timeout: 8000, onRouteClose: true, stack: true, offset: '10px'});
                }

//                var tempObj = {
//                    id: i,
//                    title: array[i].title,
//                    module: array[i].module,
//                    start: array[i].startDate,
//                    type: array[i].type,
//                    description: array[i].description,
//                    createdBy: array[i].createdBy,
//                    completed: array[i].completed
//                    color: #asdj
//                }

                $('#calendarDiv').fullCalendar('renderEvent', {
                    id: i,
                    title: array[i].title,
                    module: array[i].module,
                    start: array[i].startDate,
                    type: array[i].type,
                    description: array[i].description,
                    createdBy: array[i].createdBy,
                    completed: array[i].completed,
                    color: color1,
                }, true);

//               newArr.push(tempObj);
            }
            // console.log(newArr);
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
        // console.log(array[i].startDate);
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
                    sAlert.success(array[i].title + "\n due on : " + array[i].date +"/"+ array[i].month+"/" + array[i]. year,
                     {effect: 'genie', position: 'bottom-right',
                      timeout: 8000, onRouteClose: true, stack: true, offset: '10px'});
                }
        var tempObj = {
            id: i,
            title: array[i].title,
            module: array[i].module,
            start: array[i].startDate,
            type: array[i].type,
            description: array[i].description,
            createdBy: array[i].createdBy,
            completed: array[i].completed,
            color: color1
        }
        newArr.push(tempObj);
        }
        // console.log("im runningggg");
};
    $('#calendarDiv').fullCalendar({
        // themeSystem: 'bootstrap3',
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
                     "\nModule: " + event.module +
                     "\nDescription: " + event.description +
                     "\nDate & Time: " + moment(event.start).format("Do MMM YY") +
                      ", " + moment(event.start).format("hh:mm A"));
                     // "\nEvent Date: " + event.date + "/"event.month+"/"event.year +
                     //"\nEvent time: " + moment(event.start).format("hh:mm A"));
                 if(event.end){
                     alert(print + " to " + moment(event.end).format("hh:mm A"));
                 } else {
                 //alert(print);
                var print = JSON.parse(JSON.stringify(print));
                // console.log(print);
                sAlert.close(sAlert.warning());
                sAlert.warning(print
                    ,{effect: 'scale', position: 'top-right', timeout: 'none',onRouteClose: true, stack: true, offset: '80px'});
            };
            console.log(alert._id);
            },
        });
     }

     Template.calendar.onRendered(() => SearchAndParse(""));
