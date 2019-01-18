const userProfileSchema = {
    "required": ["email", "fullname"],
    "properties": {
      "about": { "type": "string"},
      "email": { "type": "string", "minLength": 1, "propertyNames": { "format": "email" }}, // regex @ 
      "fullname": { "type": "string", "minLength": 1},
      "nickname": { "type": "string", "minLength": 1},
    }
};

const forumSchema = {
  "required": ["slug", "title", "user"],
  "properties": {
    "posts": { "type": "number"},
    "slug": { "type": "string", "minLength": 1},
    "threads": { "type": "number" },
    "title": { "type": "string", "minLength": 1},
    "user": { "type": "string", "minLength": 1},
  }
};

const threadSchema = {
  "required": ["author", "message", "title"],
  "properties": {
    "author": { "type": "string", "minLength": 1},
    "created": { "type": "string", "minLength": 1},
    "forum": { "type": "string", "minLength": 1},
    "id": { "type": "number" },
    "message": { "type": "string", "minLength": 1},
    "slug": { "type": "string", "minLength": 1},
    "title": { "type": "string", "minLength": 1},
    "votes": { "type": "number" }
  }
};


const threadPostSchema = {
  "required": ["author", "message"],
  "properties": {
    "author": { "type": "string", "minLength": 1},
    "created": { "type": "string", "minLength": 1},
    "forum": { "type": "string", "minLength": 1},
    "id": { "type": "number" },
    "message": { "type": "string", "minLength": 1},
    "isEdited": { "type": "string", "minLength": 1},
    "parent": { "type": "number" },
    "thread": { "type": "number" }
  }
}



module.exports.userProfileSchema = userProfileSchema;
module.exports.forumSchema = forumSchema;
module.exports.threadSchema = threadSchema;
module.exports.threadPostSchema = threadPostSchema;
