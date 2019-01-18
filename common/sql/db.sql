CREATE EXTENSION citext;


CREATE UNLOGGED TABLE IF NOT EXISTS users (
    id          SERIAL       NOT NULL PRIMARY KEY,
    nickname    CITEXT COLLATE ucs_basic     NOT NULL UNIQUE,
    fullname    CITEXT    NOT NULL,
    email       CITEXT    NOT NULL UNIQUE,
    about       TEXT      NOT NULL DEFAULT ''
);


CREATE UNLOGGED TABLE IF NOT EXISTS forums (
    slug        CITEXT    NOT NULL PRIMARY KEY,
    posts       INTEGER   NOT NULL DEFAULT 0,
    threads     INTEGER   DEFAULT 0,
    title       CITEXT    NOT NULL,
    username    CITEXT    NOT NULL            
);


CREATE UNLOGGED TABLE IF NOT EXISTS threads (
    id          SERIAL    NOT NULL PRIMARY KEY,
    author      CITEXT    NOT NULL,
    created     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    forum       CITEXT    NOT NULL,
    message TEXT      NOT NULL,
    slug        CITEXT    UNIQUE DEFAULT NULL,
    title       TEXT      NOT NULL,
    votes       INTEGER   NOT NULL DEFAULT 0
);


CREATE UNLOGGED TABLE IF NOT EXISTS posts (
    _id         SERIAL       NOT NULL PRIMARY KEY,
    id          INTEGER       NOT NULL,
    author      CITEXT          NOT NULL,
    created     TIMESTAMP       WITH TIME ZONE NOT NULL DEFAULT NOW(),
    forum       CITEXT          NOT NULL,
    isEdited    BOOLEAN         NOT NULL DEFAULT FALSE,
    message     TEXT            NOT NULL,
    parent      INTEGER          ,
    thread      INTEGER          NOT NULL,
    path        INTEGER[]       NOT NULL
);

CREATE SEQUENCE posts_id_sequance START 1;


CREATE UNLOGGED TABLE IF NOT EXISTS votes ( 
    nickname    CITEXT    NOT NULL,
    thread_id   INTEGER          NOT NULL,
    voice       int4         NOT NULL
);
