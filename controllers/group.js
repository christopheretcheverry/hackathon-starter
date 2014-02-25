var Group = require('../models/Group');

exports.index = function(req, res){
	Group.find(function(err, groups){
		if (err) return next(err);
		res.render('groups/index', {groups: groups, title:"Groups"})
	});
}

exports.new = function(req,res){
	res.render('groups/new');
};

exports.create = function(req, res, next){
	//Hardcode dates
	// var today = new Date();
	// var tomorrow = new Date();
	var firstMorning = new Date(2014, 2, 27, 9);
	var secondMorning = new Date(2014, 2, 28, 9);
	var firstEvening = new Date(2014, 2, 27, 19);
	var secondEvening = new Date(2014, 2, 28, 19);
	
	// tomorrow.setDate(today.getDate()+2);
	var times = [firstMorning, firstEvening, secondMorning, secondEvening];

	var group = new Group({
		name: req.body.groupName,
		times:times
	});

	group.save(function(err) {
		if (err) {
			if (err.code === 11000) {
				req.flash('errors', { msg: 'Group already exists.' });
			}
			req.flash('errors', { msg: err });
			res.send(new Error("Fail Whale"));
		}
		res.redirect('/groups');
	});
};


exports.secret = function(req, res) {
	res.render('groups/secret');
};

exports.secretSubmit = function(req, res, next) {
	var name = req.param("secret")
	var user = req.user;

	Group.findOne({name: name }, function(err, group){
		if(err) return next(err);
		if(!group) return next(new Error("Cannot find group"));
		
		user.group = group.name;
		group.users.push(user);
		group.count += 1;
		group.save();
		
		user.save(function(err) {
			if (err) {
				req.flash('errors', { msg: err });
				res.send(new Error("Fail Whale"));
			}
			res.render('groups/time', {group: group});
		});
	});
};

//Get Group Times
exports.getTime = function(req, res){
	var user = req.user;
	
	//Check for null group and redirect
	Group.findOne({name: user.group }, function(err, group){
		if(err) return next(err);
		//Redirect back to group page - this group may have been deleted
		if(!group) return next(new Error("Cannot find group"));
		
		res.render('groups/time', {group: group});
		// user.save(function(err) {
		// 	if (err) {
		// 		req.flash('errors', { msg: err });
		// 		res.send(new Error("Fail Whale"));
		// 	}
		// 	
		// });
	});
}

//Time Post
exports.postTime = function(req, res) {
	var user = req.user;
	var availableDate = new Date(req.param("time"));
	user.available = availableDate;
	
	user.save(function(err){
		if(err){
			req.flash('errors', {msg: err});
			req.send(new Error("Fail Whale"));
		}
		res.redirect('/group/rules');
	})
};

//ATX Group Times
exports.getAtxTime = function(req, res){
	res.clearCookie('availableTime');
	// res.clearCookie('selectedTime');
	console.log(req.cookies);
	//Check for null group and redirect
	Group.findOne({name: 'atxs' }, function(err, group){
		if(err) return next(err);
		//Redirect back to group page - this group may have been deleted
		if(!group) return next(new Error("Cannot find group"));
		
		res.render('groups/atx', {group: group});
	});
}

//POST Group Times
exports.postAtxTime = function(req, res){
	//Preffered time
	// var time = req.param('time');
	//Check for forgery
	var selectedTime = req.param('selected');
	res.cookie('availableTime', selectedTime);
	console.log(selectedTime);
	//Access cookie
	// req.cookies.availableTime;
	//Add group time check to make sure time submitted exists
	if(req.user){
		res.redirect('/users');
	}else{
		res.redirect('/login');
	}
	
	// Group.findOne({name: 'atxs' }, function(err, group){
	// 	if(err) return next(err);
	// 	//Redirect back to group page - this group may have been deleted
	// 	if(!group) return next(new Error("Cannot find group"));
	// 	
	// 	res.render('groups/time', {group: group});
	// });
}

exports.getRules = function(req, res){
	res.render('groups/rules');
}

exports.postRules = function(req, res){
	console.log("post rules");
	var user = req.user;
	user.confirmed = true;
	user.save(function(err){
		if(err){
			req.flash('errors', {msg: err});
			req.send(new Error("Fail Whale"));
		}
		res.redirect('/group/success');
	})
}

exports.getSuccess = function(req, res){
	res.render('groups/success', {user: req.user});
}