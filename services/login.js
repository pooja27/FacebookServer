var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/test";

function handle_login_request(msg, callback){
	console.log("In handle request:"+ msg.email);	
	var json_responses;
	var email = msg.email;
	var password = msg.password;
	var res = {};
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');		
		coll.findOne({email: email}, function(err, user){
			//console.log(user);
			if (user) {
				console.log("In User!");				
				res.code = "200";
				res.value = "Success";
				res._id = user._id;
				res.password = user.password;	
				res.firstname = user.firstname;	
				res.lastname = user.lastname;	
			} else {
				res.code = "401";
				res.value = "Failed";
			}
			
			console.log("Response:: " + res);
			callback(null, res);	
		});
	});	
}

function handle_signup_request(msg, callback) {	
	console.log("In handle request:" + msg.email);
	var res = {};
	mongo.connect(mongoURL, function() {
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
		coll.insertOne({
			firstname : msg.firstname,
			lastname : msg.lastname,
			email : msg.email,
			password : msg.password,
			dob : msg.dob,
			gender : msg.gender,
			doj : new Date(),
			friends : [],
			pending_friends : [],
			groups : []
		}, function(err, user) {
			//console.log(user);
			if (user) {
				res.code = "200";
				res.value = "User Inserted!";

			} else {
				res.code = "401";
				res.value = "User Not Inserted..";
			}
			console.log("Response:: " + res);
			callback(null, res);	
		});			
	});
}

exports.handle_login_request = handle_login_request;
exports.handle_signup_request = handle_signup_request;