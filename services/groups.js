var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/test";

function handle_group_create_request(msg, callback) {
	console.log("In Group Create Request: " + msg._id);
	var _id = new mongo.ObjectID(msg._id);
	var group_id = new mongo.ObjectID();
	var group = {
			"group_name":msg.groupName,			
			"_id" : group_id
	}

	var res = {};
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('users');
		coll.updateOne({_id : _id}, { $push : {"groups" : group}}, {upsert : true}, function(err, result) {			
			console.log("After Adding Groups to the list" + result);
			if (err) {
				res.code = "401";
				res.value = "Failed";
			} else if (result) {
				var coll = mongo.collection('groups');
				coll.insert();
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

function handle_group_delete_request(msg, callback) {
	console.log("In Group Delete Request: " + msg._id);

	var _id = new mongo.ObjectID(msg._id);
	var group_id = new mongo.ObjectID(msg.group_id);
	
	console.log("Group_id" + group_id);

	var res = {};
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('users');
		coll.updateOne({_id : _id}, {$pull : {"groups" : {"_id" : group_id}}}, {upsert : true}, function(err, result) {			
			console.log("After Removing Groups From the list" + result);
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

function handle_get_all_group_request(msg, callback) {
	console.log("handle_get_all_group_request: " + msg._id);
	var _id = new mongo.ObjectID(msg._id);

	var res = {};
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('users');
		coll.findOne({_id : _id}, { groups:1 }, function(err, result) {			
			console.log("After Retreiving all Groups!" + result.groups.length);
			if (err) {
				res.code = "401";
				res.value = "Failed";
			} else if (result) {				
				res.code = "200";
				res.value = "Done";		
				res.groupList = result.groups;
			} else {
				res.code = "401";
				res.value = "Failed";
			}
			callback(null, res);			
		});
	});
}

function handle_group_members_request(msg, callback) {
	console.log("In Fetch All Members of Group Request: " + msg.group_id);
	var group_id = new mongo.ObjectID(msg.group_id);

	var res = {};
	res.groupMembersList = {};
	mongo.connect(mongoURL, function() {
		if(!(mongo.collection('groups') === undefined )){
			var coll = mongo.collection('groups');		
			if(coll!=null) {
				coll.findOne({_id : group_id}, { group_members:1 }, function(err, result) {				
					if (err) {
						res.code = "401";
						res.value = "Failed";
					} else if (result) {				
						res.code = "200";
						res.value = "Done";		
						res.groupMembersList = result.group_members;
					} else {
						res.code = "401";
						res.value = "Failed";
					}
					callback(null, res);			
				});		
			} else {
				res.code = "200";
				res.value = "No Groups!";
				callback(null, res);
			}
		}	
		else {
			res.code = "200";
			res.value = "Done";		
			res.groupMembersList = {};
		}
	});
}

function handle_group_members_search_request(msg, callback) {
	console.log("In handle_group_members_search_request");
	var firstname = msg.firstname;

	var members = [];

	var res = {};
	res.members = [];
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('users');
		coll.find({firstname : firstname}).toArray(function(err, results) {
			for (ind = 0; ind < results.length; ind++) {
				doc = results[ind];
				var newFriend = {
					"_id" : doc._id.toString(),
					firstname : doc.firstname,
					lastname : doc.lastname
				}
				res.members.push(newFriend);
			}
			res.code = "200";
			console.log("RESULTS:: " + results);
			callback(null, res);
		});
	});
}

function handle_group_members_add_request(msg, callback) {
	console.log("In handle_group_members_add_request");
	
	var firstname = msg.firstname;
	var lastname = msg.lastname;
	var _id = msg._id;
	var group_id = new mongo.ObjectID(msg.group_id);

	var friend = {
		"firstname" : msg.firstname,
		"lastname" : msg.lastname,
		"_id" : msg._id
	}
	var res = {};
	res.members = [];
	
	console.log("Group_ID => " + group_id);
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('groups');
		coll.updateOne({_id : group_id}, {$push : {	"group_members" : friend}},{upsert : true}, function(err, result) {
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

function handle_group_members_delete_request(msg, callback) {
	console.log("In handle_group_members_delete_request" + msg);	
	var _id = new mongo.ObjectID(msg._id);
	var res = {};
	

	res.members = [];	
	mongo.connect(mongoURL, function() {
		var coll = mongo.collection('groups');
		coll.updateOne({_id : _id}, { $pull : {"group_members" : {"_id" : msg.member_id}}},{upsert : true}, function(err, result) {
			console.log("After deleting friend from the list" + result);
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


exports.handle_group_members_search_request = handle_group_members_search_request;
exports.handle_group_members_request = handle_group_members_request;
exports.handle_get_all_group_request = handle_get_all_group_request;
exports.handle_group_delete_request = handle_group_delete_request;
exports.handle_group_create_request = handle_group_create_request;
exports.handle_group_members_add_request = handle_group_members_add_request;
exports.handle_group_members_delete_request = handle_group_members_delete_request;