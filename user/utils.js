const schema = require('../common/validator/jsonSchemas');
var validator = require('../common/validator/validator');


var parseUserProfle = function(data, nickname) {
    if (!validator.validate(data, schema.userProfileSchema)){
        console.error("User profile data is not valid");
        return null;
    } else {
        if (!data.nickname){
            data.nickname = nickname;
        }
        return data;
    }
}

module.exports.parseUserProfle = parseUserProfle;
