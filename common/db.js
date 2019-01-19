var pgp = require("pg-promise")(/*options*/);
var db = pgp("postgres://docker:docker@localhost:5432/tp");

module.exports.db = db;
