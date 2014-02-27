var passport = require('passport');
var _ = require('underscore');
var User = require('../models/User');
var Meeting = require('../models/Meeting');
var Group = require('../models/Group');


exports.index = function(req, res){
	// User.find({}).remove().exec();
	// Meeting.find({}).remove().exec();
	// User.update({ }, { $set: { scheduled: false }}, { multi: true }).exec();
	
	User.find(function(err, users){
		if (err) return next(err);
		res.render('users/index', {users: users, title: 'Users'});
	});
}

/**
 * GET /login
 * Login page.
 */

exports.getLogin = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/login', {
    title: 'Login',
    errors: req.flash('errors')
  });
};

/**
 * GET /signup
 * Signup page.
 */

exports.getSignup = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/signup', {
    title: 'Create Account',
    errors: req.flash('errors')
  });
};


/**
 * GET /account
 * Profile page.
 */

exports.getAccount = function(req, res) {
  res.render('account/profile', {
    title: 'Account Management',
    success: req.flash('success'),
    error: req.flash('error')
  });
};

/**
 * GET /account
 * Profile page.
 */

exports.getProfile = function(req, res, next) {
	var user = req.user;
	Meeting.find({$or : [{personOne: user}, {personTwo: user}]})
		.populate("personOne", "email")
		.populate("personTwo", "email")
		.exec(function(err, meetings){
			if(err) return next(err);
			res.render('users/profile', {
				title: 'Profile',
				user: user,
				meetings: meetings,
				success: req.flash('success'),
				error: req.flash('error')
			});
	})
};

/**
 * POST /login
 * Sign in using email and password.
 * @param {string} email
 * @param {string} password
 */

exports.postLogin = function(req, res, next) {
	req.assert('email', 'Email cannot be blank').notEmpty();
	req.assert('email', 'Email is not valid').isEmail();
	req.assert('password', 'Password cannot be blank').notEmpty();
	
	var prefferedTime = req.cookies.prefferedTime;

	var errors = req.validationErrors();

	if (errors) {
		req.flash('errors', errors);
		return res.redirect('/login');
	}

	passport.authenticate('local', function(err, user, info) {
		if (err) return next(err);

		if (!user) {
			req.flash('errors', { msg: info.message });
			return res.redirect('/login');
		}

		req.logIn(user, function(err) {
			if (err) return next(err);
			return res.redirect('/group/success');
			//Move to dispatch for other auth methods
      		if(user.group == undefined || ""){
				return res.redirect('/group/secret');
			}else if(user.available == undefined){
				return res.redirect('/group/time');
			}else if(user.confirmed == false){
				return res.redirect('/group/rules');
			}else if(user.scheduled == false){
				return res.redirect('/group/success');
			}else{
				return res.redirect('/profile');
			};
    	});
  })(req, res, next);
};

/**
 * POST /signup
 * Create a new local account.
 * @param {string} email
 * @param {string} password
 */

exports.postSignup = function(req, res, next) {
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('username', 'Username cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();
  var available = req.cookies.availableTime;

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  var user = new User({
    email: req.body.email,
    password: req.body.password,
    group: 'atxs',
    available: available,
	roles: []
  });


  if(req.body.email == "christopheretcheverry@gmail.com"){
	user.roles.push("Admin");
  }

  user.save(function(err) {
    if (err) {
      if (err.code === 11000) {
        req.flash('errors', { msg: 'User already exists.' });
      }
      return res.redirect('/signup');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/group/success');
    });
  });
};


/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.profile.name = req.body.name || '';
    user.profile.email = req.body.email || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Profile information updated.');
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 * @param {string} password
 */

exports.postUpdatePassword = function(req, res, next) {
  if (!req.body.password) {
    req.flash('error', 'Password cannot be blank.');
    return res.redirect('/account');
  }

  if (req.body.password !== req.body.confirmPassword) {
    req.flash('error', 'Passwords do not match.');
    return res.redirect('/account');
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.password = req.body.password;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Password has been changed.');
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 * @param {string} id
 */
//Don't allow delete yet
//Update to remove matches and other related objects or just set isDeleted flag
exports.postDeleteAccount = function(req, res, next) {
  User.remove({ _id: req.user.id }, function(err) {
    if (err) return next(err);
    req.logout();
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth2 provider from the current user.
 * @param {string} provider
 * @param {string} id
 */

exports.getOauthUnlink = function(req, res, next) {
  var provider = req.params.provider;
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user[provider] = undefined;
    user.tokens = _.reject(user.tokens, function(token) { return token.kind === provider; });

    user.save(function(err) {
      if (err) return next(err);
      res.redirect('/account');
    });
  });
};

/**
 * GET /logout
 * Log out.
 */

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};