const schema = require('../common/validator/jsonSchemas');
var validator = require('../common/validator/validator');
const threadDB = require('./db/threadDB');


var parseThreadPost = function(data, time) {
    if (!validator.validate(data, schema.threadPostSchema)){
        console.error("User profile data is not valid");
        return null;
    } else {
        if (!data.parent){
            data.parent = 0;
        }
        if (time){
            data.created = time;
        }
        
        return data;
    }
}

module.exports.parseThreadPost = parseThreadPost;
