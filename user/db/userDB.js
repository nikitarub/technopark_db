var DB = require('../../common/db');

var createUser = function(inputData){
    return DB.db.one('INSERT INTO users(about, email, fullname, nickname) VALUES($1, $2, $3, $4) RETURNING about, email, fullname, nickname',
        [
            inputData.about,
            inputData.email,
            inputData.fullname,
            inputData.nickname
        ]);
};


var getUsersLike = function(inputData){
    return DB.db.manyOrNone('SELECT about, email, fullname, nickname FROM users WHERE nickname = $1 OR email = $2 ', [inputData.nickname, inputData.email]);
};

var getUserByNickname = function(nickname){
    return DB.db.one('SELECT about, email, fullname, nickname FROM users WHERE nickname = $1', [nickname]);
};

var getUserByEmail = function(email){
    return DB.db.one('SELECT about, email, fullname, nickname FROM users WHERE email = $1', [email]);
};


var updateUserByNickname = function(nickname, data){

    var keys = Object.keys(data);
    var insertionData = [];
    insertionData.push(nickname);
    var queryString = "UPDATE users SET ";

    // тут происходит получение динамической строки запроса UPDATE и массива данных на вставку
    for (let [index, key] of keys.entries()){
        queryString += key + " = $" + (index + 2);
        if ((index + 2) <= keys.length){
            queryString += ", "
        }
        insertionData.push(data[key]);
    }
    queryString += ' WHERE nickname = $1 RETURNING about, email, fullname, nickname';

    return DB.db.one(queryString, insertionData);
};


module.exports.createUser = createUser;
module.exports.getUsersLike = getUsersLike;
module.exports.getUserByNickname = getUserByNickname;
module.exports.updateUserByNickname = updateUserByNickname;
module.exports.getUserByEmail = getUserByEmail;
