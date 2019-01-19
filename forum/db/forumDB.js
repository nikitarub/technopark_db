var DB = require('../../common/db');

var createForum = function(nickname, inputData){
    return DB.db.one('INSERT INTO forums(posts, slug, threads, title, username) VALUES($1, $2, $3, $4, $5) RETURNING slug, title, username AS user',
        [
            inputData.posts,
            inputData.slug,
            inputData.threads,
            inputData.title,
            nickname
        ]);
};

var getForumBySlug = function(slug){
    return DB.db.one('SELECT posts, slug, threads, title, username AS user FROM forums WHERE slug = $1', [slug]);
}

var createForumThread = function(nickname, inputData){

    var keys = Object.keys(inputData);
    var values = '(';
    var returning = '';
    var insertionData = [];
    insertionData.push(nickname);
    var queryString = "INSERT INTO threads(";

    // тут происходит получение динамической строки запроса INSERT и массива данных на вставку
    for (var [index, key] of keys.entries()){
        queryString += key; // +
        returning += key;
        addition = '';
        values +=  "$" + (index + 1);
        if ((index + 2) <= keys.length){
            queryString += ", ";
            values += ', ';
            returning += ', ';

            insertionData.push(inputData[keys[index + 1]]);
        }
        
    }
    values += ')';
    queryString += ') VALUES '+ values + ' RETURNING ' + returning + ', id';
    return DB.db.one(queryString, insertionData);
};


var getThreadsBySlug = function(slug, queryParams){
    queryParams.desc = queryParams.desc === 'true';
    if (queryParams.since && !queryParams.desc) {
        return DB.db.many('SELECT * FROM threads WHERE forum=$1 AND "created">=$2 ORDER BY $3:raw LIMIT $4', 
        [
            slug,
            queryParams.since,
            (queryParams.desc ? '"created" DESC' : '"created" ASC'),
            queryParams.limit
        ]);
    } else if (queryParams.since && queryParams.desc) {
        return DB.db.many('SELECT * FROM threads WHERE forum=$1 AND "created"<=$2 ORDER BY $3:raw LIMIT $4', 
        [
            slug,
            queryParams.since,
            (queryParams.desc ? '"created" DESC' : '"created" ASC'),
            queryParams.limit
        ]);
    } else if (!queryParams.since) {
        return DB.db.many('SELECT * FROM threads WHERE forum=$1 ORDER BY $2:raw LIMIT $3', 
        [
            slug,
            (queryParams.desc ? '"created" DESC' : '"created" ASC'),
            queryParams.limit
        ]);
    }
}


var getThreadByID = function(id){
    return DB.db.one('SELECT * FROM threads WHERE id=$1', 
    [
        id,
    ]);
}

var getThreadBySlug = function(slug){
    return DB.db.one('SELECT * FROM threads WHERE slug=$1', 
    [
        slug,
    ]);
    
}

var updateThreadByID = function(id, data){
    var keys = Object.keys(data);
    var insertionData = [];
    insertionData.push(id);
    var queryString = "UPDATE threads SET ";

    // тут происходит получение динамической строки запроса UPDATE и массива данных на вставку
    for (let [index, key] of keys.entries()){
        queryString += key + " = $" + (index + 2);
        if ((index + 2) <= keys.length){
            queryString += ", "
        }
        insertionData.push(data[key]);
    }
    queryString += ' WHERE id = $1 RETURNING *';

    return DB.db.one(queryString, insertionData);
};


var updateThreadBySlug = function(slug, data){
    var keys = Object.keys(data);
    var insertionData = [];
    insertionData.push(slug);
    var queryString = "UPDATE threads SET ";

    // тут происходит получение динамической строки запроса UPDATE и массива данных на вставку
    for (let [index, key] of keys.entries()){
        queryString += key + " = $" + (index + 2);
        if ((index + 2) <= keys.length){
            queryString += ", "
        }
        insertionData.push(data[key]);
    }
    queryString += ' WHERE slug = $1 RETURNING *';
    
    return DB.db.one(queryString, insertionData);
};


var updateForumPostsCountBySlug = function(forum, nPosts){
    DB.db.none('UPDATE forums SET posts = posts + $1 WHERE slug = $2', [nPosts, forum]);
}

var updateForumThreadsCountBySlug = function(forum, nThreads){
    DB.db.one('UPDATE forums SET threads = threads + $1 WHERE slug = $2 RETURNING *', [nThreads, forum]);
}

var getForumUsersBySlug = function(slug, queryParams){
    slug = `(SELECT slug FROM forums WHERE slug='${slug}')`
    queryParams.desc = queryParams.desc === 'true';
    if (queryParams.since && !queryParams.desc) {
        return DB.db.manyOrNone(`
        SELECT * FROM users AS U RIGHT OUTER JOIN forumusers AS FU
        ON FU.nickname = U.nickname
        WHERE FU.forum=$1:raw AND U.nickname>$2 ORDER BY $3:raw LIMIT $4
        ` 
        ,
        [
            slug,
            queryParams.since,
            (queryParams.desc ? 'FU.nickname DESC' : 'FU.nickname ASC'),
            queryParams.limit
        ]);
    } else if (queryParams.since && queryParams.desc) {
        return DB.db.manyOrNone(`
        SELECT * FROM users AS U RIGHT OUTER JOIN forumusers AS FU
        ON FU.nickname = U.nickname
        WHERE FU.forum=$1:raw AND U.nickname<$2 ORDER BY $3:raw LIMIT $4
        `, 
        [
            slug,
            queryParams.since,
            (queryParams.desc ? 'FU.nickname DESC' : 'FU.nickname ASC'),
            queryParams.limit
        ]);
    } else if (!queryParams.since) {
        return DB.db.manyOrNone(
        `
        SELECT * FROM users AS U RIGHT OUTER JOIN forumusers AS FU
        ON FU.nickname = U.nickname
        WHERE FU.forum=$1:raw ORDER BY $2:raw LIMIT $3
        `    
        , 
        [
            slug,
            (queryParams.desc ? 'FU.nickname DESC' : 'FU.nickname ASC'),
            queryParams.limit
        ]);
    }
}


var getStatusForum = function(){
    return DB.db.one('SELECT COUNT(*) AS forum FROM forums')
}
var getStatusUsers = function(){
    return DB.db.one('SELECT COUNT(*) AS user FROM users')
}
var getStatusPosts = function(){
    return DB.db.one('SELECT COUNT(*) AS post FROM posts')
}
var getStatusThreads = function(){
    return DB.db.one('SELECT COUNT(*) AS thread FROM threads')
}

var clearDB = async function(){
    await DB.db.none('TRUNCATE TABLE forums');
    await DB.db.none('TRUNCATE TABLE posts');
    await DB.db.none('TRUNCATE TABLE threads');
    await DB.db.none('TRUNCATE TABLE users');
}


var createForumUserRelations = function(forumUserPairs){
    var queryString = "INSERT INTO forumusers(forum, nickname) VALUES ";

    var values = '';
    var tmp_index = 1;

    var insertionData = [];

    for (var [index1, data] of forumUserPairs.entries()){
        
        var keys = Object.keys(data);
        values += "(";
        for (var [index, key] of keys.entries()){
            values +=  "$" + (tmp_index);
            if ((index + 2) <= keys.length){
                values += ', ';            
            }
            tmp_index += 1;
            insertionData.push(data[key]);
        }

        values += ')';
        if ((index1 + 2) <= forumUserPairs.length){
            values += ', ';            
        }
    }

    queryString += values + " ON CONFLICT ON CONSTRAINT unique_forum_user_pair DO NOTHING RETURNING *";

    
    return DB.db.manyOrNone(queryString, insertionData);
}


module.exports.createForum = createForum;
module.exports.getForumBySlug = getForumBySlug;
module.exports.createForumThread = createForumThread;
module.exports.getThreadsBySlug = getThreadsBySlug;
module.exports.getThreadByID = getThreadByID;
module.exports.getThreadBySlug = getThreadBySlug;
module.exports.updateThreadByID = updateThreadByID;
module.exports.updateThreadBySlug = updateThreadBySlug;
module.exports.updateForumPostsCountBySlug = updateForumPostsCountBySlug;
module.exports.updateForumThreadsCountBySlug = updateForumThreadsCountBySlug;
module.exports.getForumUsersBySlug = getForumUsersBySlug;
module.exports.createForumUserRelations = createForumUserRelations;


module.exports.getStatusForum = getStatusForum;
module.exports.getStatusUsers = getStatusUsers;
module.exports.getStatusPosts = getStatusPosts;
module.exports.getStatusThreads = getStatusThreads;

module.exports.clearDB = clearDB;
