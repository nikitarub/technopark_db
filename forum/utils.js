const schema = require('../common/validator/jsonSchemas');
var validator = require('../common/validator/validator');

var parseForum = function(data){
    if (!validator.validate(data, schema.forumSchema)){
        console.error("Forum data is not valid");
        return null;
    } else {
        if (!data.posts){
            data.posts = 0;
        }
        if (!data.threads){
            data.threads = 0;
        }
        return data;
    }
}


var parseForumThread = function(data, slug) {

    if (!validator.validate(data, schema.threadSchema)){
        console.error("Thread data is not valid");
        return null;
    } else {
        return data;
    }
}

module.exports.parseForumThread = parseForumThread;
module.exports.parseForum = parseForum;
