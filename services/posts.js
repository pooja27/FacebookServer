var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/test";

function handle_newsFeed_request(msg, callback) {	
	console.log("In News Feed Request: " + msg._id);
	var _id = new mongo.ObjectID(msg._id);	
	var myFriendsObjects = [];
	var myFriends = [];	
	var res  = {};
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('users');
		coll.findOne({ "_id" : _id},{"friends":1}, function(err, result) {
			console.log("Getting All friends..");
			console.log(result);
			if (err) {
				console.log("Fail :(")
				res.code = "401";
				res.value = "Failed";
				callback(null, res)
			} else if (result) {
				
				if (result.friends) {
					myFriends = result.friends;
					myFriendsObjects.push(msg._id);
					
					for (i = 0; i < myFriends.length; i++) {
						myFriendsObjects.push(myFriends[i]._id);
					}

					var coll_posts = mongo.collection('posts');
					console.log("List of myFriendIDS:: " + myFriendsObjects);
					coll_posts.find({"user_id" : {$in : myFriendsObjects}},	{
						sort : {"date_posted" : -1	}}).toArray(function(err, result1) {
						console.log(result1);
						res.code = "200";
						res.newsFeedList = result1;
						console.log("RESULTS::" + res.newsFeedList);
						callback(null, res);
					});
					
				} else {
					res.code = "200";
					callback(null, res);
				}

			} else {
				console.log("Fail :(")
				res.code = "401";
				res.value = "Failed";
				callback(null, res)
			}
		});
	});	
}

function handle_my_newsFeed_request(msg, callback) {		
	console.log("In News Feed Request: " + msg._id);
	var myFriends = [];	
	var res  = {};
	mongo.connect(mongoURL, function() {
		var coll_posts = mongo.collection('posts');
		coll_posts.find({"user_id" : msg._id},{sort:{"date_posted": -1 }}).toArray(function(err,result) {
			if (err) {
				console.log("Fail :(")
				res.code = "401";
				res.value = "Failed";
			} else if(result){
				res.code = "200";				
				res.myNewsFeedList = result;
			} else {
				console.log("Fail :(")
				res.code = "401";
				res.value = "Failed";
			}
			callback(null, res)		
		});
	});	
}

function handle_my_post_status_request(msg,callback){
	console.log("In News Feed Request: " + msg._id);
	var _id = new mongo.ObjectID(msg._id);	
	var details = msg.details;	
	
	var res  = {};
	
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('users');
		coll.findOne({"_id" : _id},function(err,results) {
			if (err) {
				console.log("Fail")
				res.code = "401";
				res.value = "Failed";
				callback(null, res);
			} else if(results){
					
				var posts_coll = mongo.collection('posts');
				posts_coll.insert({"user_id":msg._id ,"date_posted":new Date(),"firstname":results.firstname,"lastname":results.lastname,"details":details },function(err,result1){
					res.code = "200";
					callback(null, res);		
				});				
			} else {
				console.log("Fail")
				res.code = "401";
				res.value = "Failed";
				callback(null, res);
			}
					
		});
	});	
}

exports.handle_my_post_status_request = handle_my_post_status_request;
exports.handle_my_newsFeed_request = handle_my_newsFeed_request;
exports.handle_newsFeed_request = handle_newsFeed_request;