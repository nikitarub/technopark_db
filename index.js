var userDB = require('./user/db/userDB');
var userUtils = require('./user/utils');
var forumUtils = require('./forum/utils');
var forumDB = require('./forum/db/forumDB');
var threadUtils = require('./thread/utils');
var threadDB = require('./thread/db/threadDB');


const ERROR = {
    "message": "Can't find user with id #42\n"
  }

const fastify = require('fastify')({
    logger: false
});

fastify.get('/api/', async (request, reply) => {
    reply.type('application/json').code(200);
    return { url: 'world' };
});



// ------------------------------------ THREAD ------------------------------------------
fastify.post('/api/thread/:slug_or_id/create', async (request, reply) => {
    var slug_or_id = request.params.slug_or_id;

    try {
        if (Number.isInteger(+slug_or_id)){
            await forumDB.getThreadByID(slug_or_id);
        } else {
            await forumDB.getThreadBySlug(slug_or_id);
        }

    } catch (error) {
        reply.type('application/json').code(404);
        return {
            "message": "Can't find post thread by id: " + slug_or_id
          }
    }

    if (request.body.length === 0){
        reply.type('application/json').code(201);
        return [];
    }


    try {
        var promise = await userDB.getUserByNickname(request.body[0].author);

    } catch (error) {
        reply.type('application/json').code(404);
        return {
            "message": "Can't find post author by nickname: " + request.body[0].author
          }
    }

    

   
    // TODO for each in req

    var forum, thread;

    if (Number.isInteger(+slug_or_id)){  
        // если slug_or_id - id
        try {
            var promise = await forumDB.getThreadByID(+slug_or_id);
            forum = promise.forum;
            thread = +promise.id;
        } catch (error) {
            reply.type('application/json').code(404);
            return ERROR;
        }
    } else {
        // // slug_or_id - slug - ищем по slug
        try {
            var promise = await forumDB.getThreadBySlug(slug_or_id);
            forum = promise.forum;
            thread = +promise.id;
        } catch (error) {
            reply.type('application/json').code(404);
            return ERROR;
        }
    }

    var bigData = [];
    var time = new Date();
    for (var [index, body] of request.body.entries()){   
        var data; 
        data = threadUtils.parseThreadPost(body, time);
        data.forum = forum;
        data.thread = thread;

        bigData.push(data);
        
    }

    try {
        var promise = await threadDB.createTreadPost(bigData);
        reply.type('application/json').code(201);

        if (promise.message || promise === "lol"){
            reply.type('application/json').code(409);
            return {"message": "Parent post was created in another thread"}
        }
        
        var nPosts = bigData.length;
        try {
            await forumDB.updateForumPostsCountBySlug(forum, nPosts);
        } catch (error) {return "lol";}

        return promise;

    } catch (error) {
        if (error.message === "No data returned from the query."){
            return [];
        }
        reply.type('application/json').code(404);
        return ERROR;
    }

});


fastify.get('/api/thread/:slug_or_id/details', async (request, reply) => {
    try {
        if (Number.isInteger(+request.params.slug_or_id)){
            reply.type('application/json').code(200);
            var promise = await forumDB.getThreadByID(request.params.slug_or_id)
            promise.id = +promise.id;
            return promise;
        } else {
            reply.type('application/json').code(200);
            var promise = await forumDB.getThreadBySlug(request.params.slug_or_id)
            promise.id = +promise.id;
            return promise;
        }
    } catch (error) {
        reply.type('application/json').code(404);
        return ERROR
    }
});


fastify.post('/api/thread/:slug_or_id/details', async (request, reply) => {
    if (Object.keys(request.body).length === 0 ){
        if (Number.isInteger(+request.params.slug_or_id)){
            var promise = await forumDB.getThreadByID(request.params.slug_or_id);
            reply.type('application/json').code(200);
            return promise;
        } else {
            var promise = await forumDB.getThreadBySlug(request.params.slug_or_id);
            reply.type('application/json').code(200);
            return promise;
        }
    }

    try {
        if (Number.isInteger(+request.params.slug_or_id)){
            var promise = await forumDB.updateThreadByID(request.params.slug_or_id, request.body);
            reply.type('application/json').code(200);
            promise.id = +promise.id;
            return promise;
        } else {
            var promise = await forumDB.updateThreadBySlug(request.params.slug_or_id, request.body);
            reply.type('application/json').code(200);
            
            promise.id = +promise.id;
            return promise;
        }
    } catch (error) {
        reply.type('application/json').code(404);
        return ERROR;
    }
});


fastify.get('/api/thread/:slug_or_id/posts', async (request, reply) => {

    var theID;
    if (!Number.isInteger(+request.params.slug_or_id)){
        try {
            var preflightPromise = await forumDB.getThreadBySlug(request.params.slug_or_id);
            theID = preflightPromise.id;
        } catch (error) {
            reply.type('application/json').code(404);
            return {"message": "Can't find thread by slug: " + request.params.slug_or_id};
        }
    } else {
        try {
            var preflightPromise = await forumDB.getThreadByID(request.params.slug_or_id);
            theID = preflightPromise.id;
        } catch (error) {
            reply.type('application/json').code(404);
            return {"message": "Can't find thread by id: " + request.params.slug_or_id};
        }
    }

    try {
        if ((request.query.sort === "flat") ||  (!request.query.sort)){
            var promise = await threadDB.getPostsByIDFlat(theID, request.query);
        } else if (request.query.sort === "tree"){
            var promise = await threadDB.getPostsByIDTree(theID, request.query);
        } else if (request.query.sort === "parent_tree"){
            var promise = await threadDB.getPostsByIDParentTree(theID, request.query);
        }
        reply.type('application/json').code(200);
        promise.forEach(element => {
            element.id = +element.id;
            element.parent = +element.parent;
            element.thread = +element.thread;
        });
        return promise;
    } catch (error) {
        if (error.message === "No data returned from the query."){
            return [];
        }

        reply.type('application/json').code(404);
        return error;
    }
});

fastify.post('/api/thread/:slug_or_id/vote', async (request, reply) => {
    try {
        var preflightPromise = await userDB.getUserByNickname(request.body.nickname);
    } catch (error) {
        reply.type('application/json').code(404);
        return {"message": "Can't find user by nickname: " + request.body.nickname};
    }
    
    var thread;
    var savePromise;
    try {
        if (Number.isInteger(+request.params.slug_or_id)){
            var promise = await forumDB.getThreadByID(request.params.slug_or_id);

            console.log("VOTE_BODY_DATA: ", request.params.slug_or_id, request.body, " DETAILS: ", promise);
    
        } else {
            var promise = await forumDB.getThreadBySlug(request.params.slug_or_id);

            console.log("VOTE_BODY_DATA: ", request.params.slug_or_id, request.body, " DETAILS: ", promise);
    
        }
        thread = promise.id;
        savePromise = promise;
        
    } catch (error) {
        reply.type('application/json').code(404);
        return ERROR;
    }


    try {
        var promise = await threadDB.findThreadVote(request.body.nickname, thread);

        try {
            if (promise.voice != request.body.voice){
                await threadDB.updateVote(request.body.nickname, thread, request.body.voice);
                if (request.body.voice > 0){
                    try {
                        reply.type('application/json').code(200);
                        var promiseVote =  await threadDB.incrementThreadVoteBySlugOrId(request.params.slug_or_id, 1);
                        promiseVote.id = + promiseVote.id;
                        console.log("VOTE_BODY_DATA_upd: ", request.params.slug_or_id, request.body, " DETAILS: ", promiseVote);
                        console.log("PROM_VOTE_yes_pos: ", promiseVote);
                        return promiseVote;
                    } catch (error) { return error}
                } else {
                    try {
                        reply.type('application/json').code(200);
                        var promiseVote =  await threadDB.decrementThreadVoteBySlugOrId(request.params.slug_or_id, 2);
                        promiseVote.id = + promiseVote.id;
                        console.log("VOTE_BODY_DATA_upd: ", request.params.slug_or_id, request.body, " DETAILS: ", promiseVote);
                        console.log("PROM_VOTE_yes_neg: ", promiseVote);
                        return promiseVote;
                    } catch (error) { return error}
                }
            } 
            savePromise.id = +savePromise.id;
            return savePromise;
        } catch (error) {}

    } catch (error) {
        try {
            await threadDB.addVote(request.body.nickname, thread, request.body.voice);
            if (request.body.voice > 0){
                try {
                    reply.type('application/json').code(200);
                    var promiseVote =  await threadDB.incrementThreadVoteBySlugOrId(request.params.slug_or_id, 1);
                    promiseVote.id = + promiseVote.id;
                    console.log("VOTE_BODY_DATA_upd: ", request.params.slug_or_id, request.body, " DETAILS: ", promiseVote);
                    console.log("PROM_VOTE_no_pos: ", promiseVote)
                    return promiseVote;
                } catch (error) {}
            } else {
                try {
                    reply.type('application/json').code(200);
                    var promiseVote =  await threadDB.decrementThreadVoteBySlugOrId(request.params.slug_or_id, 1);
                    promiseVote.id = + promiseVote.id;
                    console.log("VOTE_BODY_DATA_upd: ", request.params.slug_or_id, request.body, " DETAILS: ", promiseVote);
                    console.log("PROM_VOTE_no_neg: ", promiseVote);
                    return promiseVote;} catch (error) {}
            }
        } catch (error) {}
        
    }
    
});



// ------------------------------------ FORUM ------------------------------------------
fastify.post('/api/forum/create', async (request, reply) => {
    var data = forumUtils.parseForum(request.body);
    var nickname;
    try {
        var promise = await userDB.getUserByNickname(request.body.user);
        nickname = promise.nickname;
    } catch (error) {
        // пользователь не найден
        reply.type('application/json').code(404);
        return ERROR;
    };


    try {
        var promise = await forumDB.createForum(nickname, data);
        reply.type('application/json').code(201);
        return promise;
    } catch (error) {
        reply.type('application/json').code(409);
        try {
            var promise = await forumDB.getForumBySlug(data.slug);
            return promise;
        } catch (error) {}
        
    };
});


fastify.get('/api/forum/:slug/details', async (request, reply) => {
    try {
        reply.type('application/json').code(200);
        var promise = await forumDB.getForumBySlug(request.params.slug);
        return promise;
    } catch (error) {
        reply.type('application/json').code(404);
        return ERROR;
    }
});


fastify.get('/api/forum/:slug/users', async (request, reply) => {
    // preflight 
    try {
        var promise = await forumDB.getForumBySlug(request.params.slug);

    } catch (error) {
        reply.type('application/json').code(404);
        return {
            "message": "Can't find forum by slug: " + request.params.slug
          }
    }


    try {
        reply.type('application/json').code(200);
        var promise = await forumDB.getForumUsersBySlug(request.params.slug, request.query);
        return promise;
    } catch (error) {
        if (error.message === "No data returned from the query."){
            reply.type('application/json').code(200);
            return [];
        }
        reply.type('application/json').code(404);
        return ERROR;
    }
});


fastify.post('/api/forum/:slug/create', async (request, reply) => {
    var data = forumUtils.parseForumThread(request.body, request.params.slug);
    var nickname;
    try {
        var promise = await userDB.getUserByNickname(request.body.author);
        nickname = promise.nickname;
    } catch (error) {
        // пользователь не найден
        reply.type('application/json').code(404);
        return ERROR;
    };
    
    var theSlug, theForum;
    if (!data.forum){
        try {
            var promise = await forumDB.getForumBySlug(request.params.slug);
            data.forum = promise.forum;
            theForum = promise.forum;
            theSlug = promise.slug + "";
        } catch (error) {
            // пользователь не найден
            reply.type('application/json').code(404);
            return ERROR;
        };
    } else {
        try {
            var promise = await forumDB.getForumBySlug(request.params.slug);
            theSlug = promise.slug + "";
            theForum = theSlug;
        } catch (error) {
            // пользователь не найден
            reply.type('application/json').code(404);
            return ERROR;
        };
    }
    

    try {
        var promise = await forumDB.createForumThread(nickname, data);
        
        reply.type('application/json').code(201);
        promise.id = +promise.id;
        promise.forum = theForum;

        try {
            await forumDB.updateForumThreadsCountBySlug(theForum, 1);
        } catch (error) {return "lol";}

        return promise;
    } catch (error) {
        reply.type('application/json').code(409);
        try {
            var promise = await forumDB.getThreadBySlug(data.slug);
            promise.id = +promise.id;
            return promise;
        } catch (error) {
            reply.type('application/json').code(409);
            return "lol";
        }
        
    };
});


fastify.get('/api/forum/:slug/threads', async (request, reply) => {
    // preflight 
    try {
        var promise = await forumDB.getForumBySlug(request.params.slug);

    } catch (error) {
        reply.type('application/json').code(404);
        return {
            "message": "Can't find forum by slug: " + request.params.slug
          }
    }


    try {
        var promise = await forumDB.getThreadsBySlug(request.params.slug, request.query);
        reply.type('application/json').code(200);
        for (var [index, each] of promise.entries()){
            each["id"] = +each["id"];
        }
        return promise;
    } catch (error) {
        reply.type('application/json').code(200);
        return [];   
    }
});



// ------------------------------------ USER ------------------------------------------
fastify.post('/api/user/:nickname/create', async (request, reply) => {
    var data = userUtils.parseUserProfle(request.body, request.params.nickname);
        
    try {
        var promise = await userDB.createUser(data);
        reply.type('application/json').code(201);
        return promise;
    } catch (error) {
        reply.type('application/json').code(409);
        try {
            var promise = await userDB.getUsersLike(data);
            return promise
        } catch (error) {};
    };

});

fastify.get('/api/user/:nickname/profile', async (request, reply) => {
    try {
        var promise = await userDB.getUserByNickname(request.params.nickname);
        reply.type('application/json').code(200);
        return promise;
    } catch (error) {
        reply.type('application/json').code(404);
        return ERROR;
    };
});


fastify.post('/api/user/:nickname/profile', async (request, reply) => {
    if (!Object.keys(request.body).length){
        var promise = await userDB.getUserByNickname(request.params.nickname);
        reply.type('application/json').code(200);
        return promise;
    };

    try {
        var promise = await userDB.updateUserByNickname(request.params.nickname, request.body);
        reply.type('application/json').code(200);
        return promise;
    } catch (error) {
        try {
            // если найден такой пользователь, то конфликт новых данных
            var promise = await userDB.getUserByEmail(request.body.email);
            reply.type('application/json').code(409);
            return ERROR;
        } catch (error) {
            // пользователь не найден, собсна 404
            reply.type('application/json').code(404);
            return ERROR;
        };
    };
});


// ------------------------------------ POST ------------------------------------------

fastify.get('/api/post/:id/details', async (request, reply) => {
    var result = new Object;
    try {
        var promisePost = await threadDB.getPostDetailsByID(request.params.id);
        reply.type('application/json').code(200);
        result.post = promisePost;
        result.post.isEdited = promisePost.isedited;

        if (request.query.related === undefined){
            return result;
        }

        var arrayOfStrings = request.query.related.split(',');
        
        if (arrayOfStrings.includes("user")){
            try {
                var promise = await threadDB.getAuthor(promisePost.author);
                result.author = promise;
            } catch (error) {return error;}
        };

        if (arrayOfStrings.includes("forum")){
            try {
                result.forum = await threadDB.getForum(promisePost.forum);
                result.forum.user = result.forum.username;
            } catch (error) {return error;}
        };

        if (arrayOfStrings.includes("thread")){
            try {
                result.thread = await threadDB.getThread(promisePost.thread);
            } catch (error) {return error;}
        };

        return result;
    } catch (error) {
        reply.type('application/json').code(404);
        return ERROR;
    };
});



fastify.post('/api/post/:id/details', async (request, reply) => {

    var promise
    if (Object.keys(request.body).length === 0){
        try {
            promise = await threadDB.getPostDetailsByID(request.params.id);
            reply.type('application/json').code(200);
            return promise;
        } catch (error) {
            reply.type('application/json').code(404);
            return ERROR
        }
    } else {
        try {
            promise = await threadDB.getPostDetailsByID(request.params.id);
            if (promise.message === request.body.message){
                reply.type('application/json').code(200);
                return promise;
            }

        } catch (error) {
            reply.type('application/json').code(404);
            return ERROR
        }        
    }
    
        
    try {
        var promise = await threadDB.updatePostDetailsByID(request.params.id, request.body.message);
        reply.type('application/json').code(200);
        promise.isEdited = promise.isedited;
        return promise;
    } catch (error) {
        reply.type('application/json').code(404);
        return ERROR
    };

});



// ------------------------------------ SERVICE ------------------------------------------



fastify.get('/api/service/status', async (request, reply) => {
    var result = new Object;
    try {
        var promise = await forumDB.getStatusForum();
        result.forum = +promise.forum;
        promise = await forumDB.getStatusPosts();
        result.post = +promise.post;
        promise = await forumDB.getStatusThreads();
        result.thread = +promise.thread;
        promise = await forumDB.getStatusUsers();
        result.user = +promise.user;

        reply.type('application/json').code(200);
        return result;
    } catch (error) {
        reply.type('application/json').code(404);
        return ERROR;
    };
});


fastify.post('/api/service/clear', async (request, reply) => {

    try {
        await forumDB.clearDB();
        reply.type('application/json').code(200);
        return null;
    } catch (error) {
        return "lol";
    }
});


fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
    try {
      var json = JSON.parse(body)
      done(null, json)
    } catch (err) {
    //   err.statusCode = 400
      done(null, undefined);
    }
  })


fastify.listen(5000, (err, address) => {
    if (err) throw err;
    fastify.log.info(`server listening on ${address}`);
});
