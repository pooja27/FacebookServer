var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/test";

function handle_user_details(msg, callback) {
	console.log("In user profile handle request:"+ msg._id);	
	var _id = new mongo.ObjectID(msg._id);
	console.log("OBJECT ID:: " + _id);	
	var json_responses;
	var email = msg.email;
	var res = {};
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');		
		coll.findOne({_id: _id}, function(err, user){
			if (user) {
				res.code = "200";
				res.user = user;
			} else {
				res.code = "401";
				res.value = "Failed";
			}			
			//console.log("Response:: " + res);
			callback(null, res);	
		});
	});	
}

function update_about_queue_request(msg,callback){
	console.log("In user about update handle request:"+ msg._id);	
	
	var json_responses;
	//var _id = msg._id;
	var _id = new mongo.ObjectID(msg._id);
	var fromcity = msg.fromcity;
	var currentcity = msg.currentcity;
	
	var about = msg.about;
	var work = msg.work;
	
	var education = msg.education;
	var contact = msg.contact;
	
	var sports = msg.sports;
	var music = msg.music;
	var interests = msg.interests;
	
	var res = {};
	mongo.connect(mongoURL, function() {
		// console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
		coll.updateOne({
			_id : _id
		}, {
			$set:{
				"fromcity" : fromcity,
				"currentcity" : currentcity,
				"about" : about,
				"work" : work,
				"education" : education,
				"contact" : contact,
				"sports" : sports,
				"music" : music,
				"interests" : interests
			}
		}, {
			upsert : true
		}, function(err, result) {
			console.log("After updating about for the user:: " + result);
			if (err) {
				res.code = "401";
				res.value = "Failed";
			} else {
				console.log("In 200!");
				res.code = "200";
				res.value = "Done";
			}
			console.log("Response:: " + res);
			callback(null, res)
		});
	});
}

function handle_friend_list_request(msg,callback) {
	console.log(mongo.testVar);
	console.log("In friend list handle request: " + msg._id);	
	
	var _id = new mongo.ObjectID(msg._id);
	console.log("OBJECT ID:: "+_id);
	
	var res = {};
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('users');
		coll.findOne({ "_id" : _id},{friends:1}, function(err, result) {
			console.log(result.friends);
			if (err) {
				console.log("Fail :(")
				res.code = "401";
				res.value = "Failed";
			} else {
				res.code = "200";				
				res.friendList = result.friends;
			}
			callback(null, res)
		});
	});
}

function handle_pending_friend_list_request(msg,callback) {
	console.log("In pending friend list handle request: " + msg._id);	
	
	var _id = new mongo.ObjectID(msg._id);
	console.log("OBJECT ID:: "+_id);	
	var res = {};
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('users');
		coll.findOne({ "_id" : _id},{pending_friends:1}, function(err, result) {
			console.log(result.friends);
			if (err) {
				console.log("Fail :(")
				res.code = "401";
				res.value = "Failed";
			} else if(result){
				res.code = "200";				
				res.pendingFriendList = result.pending_friends;
			} else {
				console.log("Fail :(")
				res.code = "401";
				res.value = "Failed";
			}
			callback(null, res)
		});
	});
}

function handle_search_request_queue_request(msg,callback) {
	console.log("In search friend list handle request: " + msg._id);		
	var _id = new mongo.ObjectID(msg._id);
	var firstname = msg.firstname;
	
	console.log("OBJECT ID:: "+_id );
	console.log("FirstName:: " + firstname );
	
	var myFriends = [];
	var myFriendsObjects = [];
	
	var res = {};
	res.nonFriends = [];
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('users');
		coll.findOne({ "_id" : _id} , {friends:1, pending_friends:1}, function(err, result) {
			//console.log(result.friends);
			if (err) {				
				console.log("Fail :(")
				res.code = "401";
				res.value = "Failed";
				
			} else if(result){				
						
				if(result.pending_friends)
					myFriends = result.pending_friends;
				if(result.friends)
					for(i = 0 ; i < result.friends.length ; i++ ){
						myFriends.push(result.friends[i]);
					}
				//console.log("MY FRIENDS ARE:: " + myFriends);
				
				for(i = 0 ; i < myFriends.length ; i++ ){					
					myFriendsObjects.push(new mongo.ObjectID(myFriends[i]._id));
				}
				
				//console.log("myFriendsObjects:: " + myFriendsObjects);
				/*	coll.find({ $and: [{ firstname:firstname }, { "_id": {$nin: myFriendsObjects}}]}).each(function(err, doc) {
					  
					var newJson = JSON.parse(JSON.stringify(doc));
					if(doc != null) {	
						  console.log("Doc from Each ");
						  var newFriend = {"_id":doc._id.toString(),firstname:doc.firstname,lastname:doc.lastname}
						  console.log(newFriend);
						  res.nonFriends.push(newFriend);					 
						 }
					res.code = 200;
					console.log("Non Friends are: ")
					callback(null, res);
				});	*/			
				
				coll.find({	$and : [ {firstname : firstname}, {	_id : {$nin : myFriendsObjects}} ]}).toArray(function(err, results){
				     //console.log(results)
				     for(ind = 0;ind<results.length;ind++) {
						doc = results[ind];
						var newFriend = {
							"_id" : doc._id.toString(),
							firstname : doc.firstname,
							lastname : doc.lastname
						}
						res.nonFriends.push(newFriend);
						//console.log("res.nonFriends:: " + res.nonFriends);
					}
				    res.code = "200";						    
				    //console.log("RESULTS:: " + results);
				    callback(null, res);
				  });
				
			} else {				
				console.log("Fail :(")
				res.code = "401";
				res.value = "Failed";
			}
			
		});
	});
}

function handle_friend_add_request(msg, callback) {
	console.log("In Friend Add Request: " + msg._id);

	var friend_id = new mongo.ObjectID(msg.friend_id);
	var friend = {
			"firstname":msg.firstname,
			"lastname":msg.lastname,
			"_id":msg._id
	}

	console.log("FRIEND::" + friend);
	var res = {};
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('users');
		coll.updateOne({_id : friend_id}, { $push : {"pending_friends" : friend}}, {upsert : true}, function(err, result) {			
			console.log("After Adding friend to the list" + result);
			if (err) {
				res.code = "401";
				res.value = "Failed";
			} else if (result) {				
				res.code = "200";
				res.value = "Done";
				
						
			} else {
				res.code = "401";
				res.value = "Failed";
			}
			callback(null, res);
			
		});
	});
}


function handle_friend_accept_request(msg, callback) {
	console.log("In Friend Add Request: " + msg._id);

	var _id = new mongo.ObjectID(msg._id);
	var friend = {
			"firstname":msg.firstname,
			"lastname":msg.lastname,
			"_id":msg.friend_id
	}
	
	var res = {};
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('users');
		coll.updateOne({_id : _id}, { $push : {"friends" : friend}}, {upsert : true}, function(err, result) {			
			console.log("After Adding friend to the list" + result);
			if (err) {
				res.code = "401";
				res.value = "Failed";
			} else if (result) {				
				res.code = "200";
				res.value = "Done";
				
				//Removing from the pending friends list
				console.log("Removing From Pending Friends" + friend._id+ " " + friend.firstname+friend.lastname);
				coll.updateOne({_id : _id}, { $pull : {"pending_friends" : {"_id" : friend._id}}}, function(err, result1) {
					console.log("Removed From Pending Friends" + result1);
				
				});
						
			} else {
				res.code = "401";
				res.value = "Failed";
			}
			callback(null, res);
			
		});
	});
}


exports.handle_friend_add_request = handle_friend_add_request;
exports.handle_pending_friend_list_request = handle_pending_friend_list_request;
exports.handle_friend_list_request = handle_friend_list_request;
exports.handle_user_details = handle_user_details;
exports.update_about_queue_request = update_about_queue_request;
exports.handle_search_request_queue_request = handle_search_request_queue_request;
exports.handle_friend_accept_request = handle_friend_accept_request;