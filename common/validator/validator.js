var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true});

var validate = function(data, schema) {
    var validate = ajv.compile(schema);
    var valid = validate(data);
    if (valid) return true;
    return false;
}

module.exports.validate = validate;
