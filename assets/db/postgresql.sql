CREATE TABLE IF NOT EXISTS users (
    nickname    VARCHAR(255)    NOT NULL PRIMARY KEY UNIQUE,
    fullname    VARCHAR(255)    NOT NULL,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    about       TEXT            NOT NULL DEFAULT ''
);



CREATE TABLE IF NOT EXISTS forums (
    slug        VARCHAR(255)    NOT NULL PRIMARY KEY,
    postCount   INTEGER         NOT NULL DEFAULT 0,
    threadCount INTEGER         NOT NULL DEFAULT 0,
    title       VARCHAR(255)    NOT NULL,
    username    VARCHAR(255)    NOT NULL REFERENCES users(nickname)            
);

CREATE TABLE IF NOT EXISTS threads (
    id          BIGSERIAL       NOT NULL PRIMARY KEY,
    author      VARCHAR(255)    NOT NULL REFERENCES users (nickname),
    created     timestamp        NOT NULL,
    forum       VARCHAR(255)    NOT NULL REFERENCES forums (slug),
    messageText TEXT            NOT NULL,
    slug        VARCHAR(255)    NOT NULL UNIQUE,
    title       TEXT            NOT NULL,
    votes       INTEGER         NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS posts (
    id          BIGSERIAL       NOT NULL PRIMARY KEY,
    author      VARCHAR(255)    NOT NULL REFERENCES users (nickname),
    created     timestamp        NOT NULL ,
    forum       VARCHAR(255)    NOT NULL REFERENCES forums (slug),
    isEdited    BOOLEAN         NOT NULL DEFAULT FALSE,
    messageText TEXT            NOT NULL,
    parent      BIGINT          NOT NULL REFERENCES posts (id),
    thread      BIGINT          NOT NULL REFERENCES threads (id)
);

CREATE TABLE IF NOT EXISTS votes ( 
    nickname    VARCHAR(255)    NOT NULL REFERENCES users (nickname),
    voice       int4         NOT NULL
);

CREATE TABLE IF NOT EXISTS forumUserRelation (
    username        VARCHAR(255)    NOT NULL REFERENCES users (nickname),
    forum       VARCHAR(255)    NOT NULL REFERENCES forums (slug)       
);
