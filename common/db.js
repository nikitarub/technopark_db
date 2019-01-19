var pgp = require("pg-promise")(/*options*/);
var db = pgp("postgres://docker:docker@localhost:5432/tp");

module.exports.db = db;


// db.one("SELECT $1 AS value", 123)
//     .then(function (data) {
//         console.log("DATA:", data.value);
//     })
//     .catch(function (error) {
//         console.log("ERROR:", error);
//     });

// const { Pool, Client } = require('pg')

// const connectionString = 'postgres://docker:docker@localhost:5432/tp'

// const pool = new Pool({
//   connectionString: connectionString,
// })

// pool.query('SELECT NOW()', (err, res) => {
//     console.log(err, res)
//     pool.end()
// })



// module.exports.db = pool;
