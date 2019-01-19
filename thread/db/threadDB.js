var DB = require('../../common/db');

var getNextIDPost = function(){
    return DB.db.one('SELECT COUNT(*)::integer AS id, (SELECT id FROM posts ORDER BY id DESC LIMIT 1) AS _id FROM posts') //"SELECT id from posts order by id desc limit 1"); 
}

var nextID;
// НЕ ТРОГАТЬ 
async function getID(){
    try {
        nextID = await getNextIDPost();
        nextID = nextID.id + 0;
    } catch (error) {
        nextID = 0;
        // выписать сюда каунт await getNextIDPost();
    }
}
getID();



var getPathPost = function(postID){
    return DB.db.one("SELECT path FROM posts WHERE id = $1 LIMIT 1", [postID]);
}

var createPathArray = async function(post){
    var array = [];
    array.push(post.id);
    
    string = await createPathString(array);

    var pathPost;
    if (!post.parent) {
        pathPost = post.path || string;
    } else {
        var promisePath = await getPathPost(post.parent)
        promisePath.path.push(post.id);
        var pathString = await createPathString(promisePath.path);
        pathPost = post.path || pathString || string
    }

    return pathPost;
}

function createPathString(array){
    var string = "{";
    var index = 0;
    array.forEach(element => {
        string += element;
        if (index < array.length - 1){
            string += ", ";
        }
        index += 1;
    });

    string += "}";
    return string;
}


function getParentForumAndThread(parent){
    return DB.db.one('SELECT forum, thread FROM posts WHERE id=$1', [parent]);
}

var createTreadPost = async function(inputData){
    // ALARM проверка только на 1-ый пост
    if (inputData[0].parent){
        try {
            var promise = await getParentForumAndThread(inputData[0].parent);
            if (promise.thread != inputData[0].thread){
                return {"message": "Parent post was created in another thread"}
            }
        } catch (error) {
            return "lol";}
    }

    var keys = Object.keys(inputData[0]);
    var insertionData = [];
    var queryString = "INSERT INTO posts(";
    

    // тут происходит подбор ключей для вставки
    for (var [index, key] of keys.entries()){
        queryString += key; // +
        if ((index + 2) <= keys.length){
            queryString += ", ";          
        }
        
    }
    queryString += ', id, path) VALUES '; //+ values + ' RETURNING *';

    var values = '';
    var tmp_index = 1;

    for (var [index1, data] of inputData.entries()){
        nextID += 1;
        data.id = nextID;
        data.path = await createPathArray(data);

        

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
        if ((index1 + 2) <= inputData.length){
            values += ', ';            
        }

    }

    queryString += values + " RETURNING *";
    
    // update n thread and m posts;
    return DB.db.many(queryString, insertionData);

}


/*
var createTreadPost = async function(inputData){
    const nextID = await getNextIDPost();
    inputData.id = nextID.nextval;
    // inputData.id = 42;
    inputData.path = await createPathArray(inputData);

    var keys = Object.keys(inputData);
    var values = '(';
    var insertionData = [];
    var queryString = "INSERT INTO posts(";

    // тут происходит получение динамической строки запроса INSERT и массива данных на вставку
    for (var [index, key] of keys.entries()){
        queryString += key; // +
        addition = '';
        values +=  "$" + (index + 1);
        if ((index + 2) <= keys.length){
            queryString += ", ";
            values += ', ';            
        }
        insertionData.push(inputData[key]);
        
    }
    values += ')';
    queryString += ') VALUES '+ values + ' RETURNING *';
    
    return DB.db.one(queryString, insertionData);
}
*/


var findThreadVote = function(nickname, thread){
    return DB.db.one('SELECT * FROM votes WHERE nickname = $1 AND thread_id = $2', [nickname, thread]);
}

var addVote = function(nickname, thread, voice){
    // добавить голос c voice 
    return DB.db.one('INSERT INTO votes(nickname, thread_id, voice) VALUES ($1, $2, $3) RETURNING *', [nickname, thread, voice]);
}

var updateVote = function(nickname, thread, voice){
    // обновить голос на voice
    return DB.db.one('UPDATE votes SET voice = $3 WHERE nickname = $1 AND thread_id = $2 RETURNING *', [nickname, thread, voice]);

}

var incrementThreadVoteBySlugOrId = function(slug_or_id, voice){
    // повысить общий vote на voice
    if (Number.isInteger(+slug_or_id)){
        return DB.db.one('UPDATE threads SET votes = votes + $1 WHERE id = $2 RETURNING *', [voice, slug_or_id]);
    } else {
        return DB.db.one('UPDATE threads SET votes = votes + $1 WHERE slug = $2 RETURNING *', [voice, slug_or_id]);
    }
}


var decrementThreadVoteBySlugOrId = function(slug_or_id, voice){
    // понизить общий vote на voice
    if (Number.isInteger(+slug_or_id)){
        return DB.db.one('UPDATE threads SET votes = votes - $1 WHERE id = $2 RETURNING *', [voice, slug_or_id]);
    } else {
        return DB.db.one('UPDATE threads SET votes = votes - $1 WHERE slug = $2 RETURNING *', [voice, slug_or_id]);
    }
}


var getPostsByIDFlat = function(id, queryParams){


    var idQuery = '';
    if (!Number.isInteger(+id)){ // slug_or_id
        idQuery = 'SELECT id::integer FROM threads WHERE slug=$1'
        
    } else {
        idQuery = 'SELECT id::integer FROM threads WHERE id=$1'
    }



    if (queryParams.desc === "true"){
        queryParams.desc = true;
    } else {
        queryParams.desc = false;
    }
    
    const pathSortRule = queryParams.desc ? 'id DESC' : 'id ASC';
    if (queryParams.since && !queryParams.desc) {
        return DB.db.many('SELECT * FROM posts WHERE thread=('+idQuery+') AND id>$2 ORDER BY $3:raw LIMIT $4', 
        [
            id,
            queryParams.since,
            pathSortRule,
            queryParams.limit
        ]);
    } else if (queryParams.since && queryParams.desc) {
        return DB.db.many('SELECT * FROM posts WHERE thread=('+idQuery+') AND id<$2 ORDER BY $3:raw LIMIT $4', 
        [
            id,
            queryParams.since,
            pathSortRule,
            queryParams.limit
        ]);
    } else if (!queryParams.since) {
        return DB.db.many('SELECT * FROM posts WHERE thread=('+idQuery+') ORDER BY $2:raw LIMIT $3', 
        [
            id,
            pathSortRule,
            queryParams.limit
        ]);
    }
}


var getPostsByIDTree = function(id, queryParams){

    var idQuery = '';
    if (!Number.isInteger(+id)){ // slug_or_id
        idQuery = 'SELECT id::integer FROM threads WHERE slug=$1'
        
    } else {
        idQuery = 'SELECT id::integer FROM threads WHERE id=$1'
    }



    if (queryParams.desc === "true"){
        queryParams.desc = true;
    } else {
        queryParams.desc = false;
    }
    
    const pathSortRule = queryParams.desc ? 'path DESC' : 'path, id ASC';
    
    if (queryParams.since && !queryParams.desc) {
        return DB.db.manyOrNone(`SELECT * FROM posts
        WHERE thread=(`+idQuery+`) AND path > (SELECT path FROM posts WHERE id=$2)
        ORDER BY $3:raw LIMIT $4`,
        [
            id,
            queryParams.since,
            pathSortRule,
            queryParams.limit
        ]);   
    } else if (queryParams.since && queryParams.desc) {
        return DB.db.manyOrNone(`SELECT * FROM posts
        WHERE thread=(`+idQuery+`) AND path < (SELECT path FROM posts WHERE id=$2)
        ORDER BY $3:raw LIMIT $4`,
        [
            id,
            queryParams.since,
            pathSortRule,
            queryParams.limit
        ]);   
    } else if (!queryParams.since) {
        return DB.db.manyOrNone(`SELECT * FROM posts
        WHERE thread=(`+idQuery+`) 
        ORDER BY $2:raw LIMIT $3`,
        [
            id,
            pathSortRule,
            queryParams.limit
        ]);   
    }

}

var getPostsByIDParentTree = function(id, queryParams) {

    var idQuery = '';
    if (!Number.isInteger(+id)){ // slug_or_id
        idQuery = 'SELECT id::integer FROM threads WHERE slug=$1'
        
    } else {
        idQuery = 'SELECT id::integer FROM threads WHERE id=$1'
    }

    
    if (queryParams.desc === "true"){
        queryParams.desc = true;
    } else {
        queryParams.desc = false;
    }
    const pathSortRule = queryParams.desc ? 'Parent.parent_id DESC, path ASC' : 'path ASC';
    const idSortRule = queryParams.desc ? 'id DESC' : 'id ASC';
    if (queryParams.since && !queryParams.desc) {
        return DB.db.manyOrNone(
            `SELECT * FROM posts
            JOIN (
                SELECT id AS parent_id FROM posts WHERE parent = 0 AND thread=(`+idQuery+`) AND path[1] > (SELECT path[1] FROM posts WHERE id=$2)
                ORDER BY $3:raw LIMIT $4
            ) AS Parent
            ON (thread=(`+idQuery+`) AND Parent.parent_id=path[1])
            ORDER BY $5:raw
            `,
            [
                id,
                queryParams.since,
                idSortRule,
                queryParams.limit,
                pathSortRule
            ]
        );
    } else if (queryParams.since && queryParams.desc){
        return DB.db.manyOrNone(
            `SELECT * FROM posts
            JOIN (
                SELECT id AS parent_id FROM posts WHERE parent = 0 AND thread=(`+idQuery+`) AND path[1] < (SELECT path[1] FROM posts WHERE id=$2)
                ORDER BY $3:raw LIMIT $4
            ) AS Parent
            ON (thread=(`+idQuery+`) AND Parent.parent_id=path[1])
            ORDER BY $5:raw
            `,
            [
                id,
                queryParams.since,
                idSortRule,
                queryParams.limit,
                pathSortRule
            ]
        );   
    } else if (!queryParams.since) {
        return DB.db.manyOrNone(
            `SELECT * FROM posts
            JOIN (
                SELECT id AS parent_id FROM posts WHERE parent = 0 AND thread=(`+idQuery+`)
                ORDER BY $3:raw LIMIT $4
            ) AS Parent
            ON (thread=(`+idQuery+`) AND Parent.parent_id=path[1])
            ORDER BY $5:raw
            `,
            [
                id,
                queryParams.since,
                idSortRule,
                queryParams.limit,
                pathSortRule
            ]
        );    
    }
}


function getAuthor(author){
    return DB.db.one("SELECT * FROM users WHERE nickname=$1",[author]);
}
function getForum(forum){
    return DB.db.one("SELECT * FROM forums WHERE slug=$1",[forum]);
}
function getThread(thread){
    return DB.db.one("SELECT * FROM threads WHERE id=$1",[thread]);
}

var getPostDetailsByID = function(id){
    return DB.db.one("SELECT * FROM posts WHERE id=$1", [id]);
}


var updatePostDetailsByID = function(id, message){
    return DB.db.one("UPDATE posts SET message=$1, isedited=true WHERE id=$2 RETURNING *", [message, id]);
}

module.exports.addVote = addVote;
module.exports.updateVote = updateVote;
module.exports.incrementThreadVoteBySlugOrId = incrementThreadVoteBySlugOrId;
module.exports.decrementThreadVoteBySlugOrId = decrementThreadVoteBySlugOrId;
module.exports.createTreadPost = createTreadPost;
module.exports.findThreadVote = findThreadVote;
module.exports.getPostsByIDFlat = getPostsByIDFlat;
module.exports.getPostsByIDTree = getPostsByIDTree;
module.exports.getPathPost = getPathPost;
module.exports.getPostsByIDParentTree = getPostsByIDParentTree;
module.exports.getPostDetailsByID = getPostDetailsByID;
module.exports.updatePostDetailsByID = updatePostDetailsByID;

module.exports.getAuthor = getAuthor;
module.exports.getForum = getForum;
module.exports.getThread = getThread;
