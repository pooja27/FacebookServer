/**
 * New node file
 */
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/test";

exports.checkLogin = function(req,res){
	// These two variables come from the form on
	// the views/login.hbs page
	var email = req.param("email");
	var password = req.param("password");
	console.log(password +" is the object");
	var json_responses;

	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');		
		coll.findOne({email: email, password:password}, function(err, user){
			//console.log(user);
			if (user) {
				// This way subsequent requests will know the user is logged in.
				req.session.email = user.email;
				console.log(req.session.email + " is the session");
				json_responses = {"statusCode" : 200};
				res.send(json_responses);

			} else {
				console.log("returned false");
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
		});
	});
};

exports.showUserProfile = function(req, res) {
	
	var username;
	if(req.params.user_id === '-1'){		
		username = req.session.username;		
	} else user_id = req.params.user_id;
	
	
	var json_responses;
	var userDetails;
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');		
		coll.findOne({email: username}, function(err, user){
			console.log(user);
			if (user) {
				// This way subsequent requests will know the user is logged in.
				req.session.username = user.username;
				console.log(req.session.username +" is the session");				
				res.render("displayUserProfile",{'email':user.email,'firstname':user.firstname, 'lastname':user.lastname});

			} else {
				console.log("returned false");
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
		});
	});
	
	
	
}

//Redirects to the homepage
exports.redirectToHomepage = function(req,res)
{
	//Checks before redirecting whether the session is valid
	if(req.session.email)
	{
		mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('users');		
			coll.findOne({email: req.session.email}, function(err, user){
				console.log(user);
				if (user) {res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				res.render("temp",{email:req.session.email,firstname:user.firstname,lastname:user.lastname,gender:user.gender,dob:user.dob});}
			});
		});
		
		
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		
	}
	else
	{
		res.redirect('/');
	}
};

//Signup
exports.signup = function(req,res)
{
	var json_responses;
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');		
		coll.insertOne({firstname: req.body.signupDetails.firstname, lastname:req.body.signupDetails.lastname , email:req.body.signupDetails.email, password:req.body.signupDetails.password,dob:req.body.signupDetails.dob,gender:req.body.signupDetails.gender,doj:new Date()}, function(err, user){
			if (err) throw err;
			//console.log("Record added as "+user[0]._id);
	
			json_responses = {"statusCode" : 200 , "message":"Inserted in Users"};
			res.send(json_responses);
		});
	});
}
//Logout the user - invalidate the session
exports.logout = function(req,res)
{
	req.session.destroy();
	res.redirect('/');
};

