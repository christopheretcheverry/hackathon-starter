var User = require('../models/User');
var Meeting = require('../models/Meeting');


/*List Metings */
exports.index = function(req, res, next){
	Meeting.find({})
		.populate('personOne', "email") 
		.populate('personTwo', "email") 
		.exec(function(err, meetings){
			if (err) return next(err);
			var count = meetings.length;
			console.log("Count: " + count);
			res.render('meetings/index', {meetings: meetings, title: "Meetings", count: count});
	});
}

/* Schedule one meeting for date */
exports.scheduleOne = function(req, res, next){
	var personOne = req.param('personOne');
	var personTwo = req.param('personTwo');
	
	User.findOne({email:personOne}, function(err, userOne){
		if (err) return next(err);
		User.findOne({email:personTwo}, function(err, userTwo){
			if (err) return next(err);
			var meeting = new Meeting({
				personOne: userOne,
				personTwo: userTwo,
				scheduleTime: userOne.available
			});
			
			//Update scheduled status
			userOne.scheduled = true;
			userTwo.scheduled = true;
			userOne.save();
			userTwo.save();
			
			meeting.save(function(err) {
				if (err) return next(err);
				//ToDo: Send emails or have action to mass send emails
				return res.redirect('/meetings');
			});
		})
	})
}

/* Schedule multiple meetings for group and date */
exports.schedule = function(req, res, next){
	var group = req.param('group');
	var date = req.param('date');

	User.find({group:group, available:date, confirmed:true, scheduled:false},function(err, users){
		console.log('users_to_schedule: ' + users.length);
		
		//Match randomly users . length until it is empty
		//Make this matching algorithm better
		//Should be random : )
		for (var i=0;i< users.length;i+=2)
		{ 
			var userOne = users[i];
			var userTwo = users[i + 1];
			
			//Break if odd number of users
			if(userTwo == undefined) break;
			
			//Send Emails here or make button for sending mass emails
			var meeting = new Meeting({
				personOne: userOne._id,
				personTwo: userTwo._id,
				scheduleTime: date,
			});
			
			userOne.scheduled = true;
			userTwo.scheduled = true;
			
			userOne.save();
			userTwo.save();
			meeting.save();
		}
		
		return res.redirect('/meetings');
	});
}

exports.sendMeetingMail = function(req, res){
	//ToDo send emails where scheduled = true;
}