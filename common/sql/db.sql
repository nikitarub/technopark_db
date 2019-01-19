CREATE EXTENSION citext;


CREATE UNLOGGED TABLE IF NOT EXISTS users (
    id          SERIAL       NOT NULL,
    nickname    CITEXT COLLATE ucs_basic     NOT NULL,
    fullname    CITEXT    NOT NULL,
    email       CITEXT    NOT NULL UNIQUE,
    about       TEXT      NOT NULL DEFAULT ''
);

CREATE UNIQUE INDEX idx_on_users_nickname_c ON "users" (nickname COLLATE "ucs_basic");

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
    id         INTEGER       NOT NULL PRIMARY KEY,
    -- id          INTEGER       NOT NULL,
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


CREATE UNLOGGED TABLE IF NOT EXISTS forumusers (
	forum            CITEXT     				 NOT NULL,
	nickname         CITEXT COLLATE ucs_basic    NOT NULL
);

-- CREATE INDEX IF NOT EXISTS voice_thread_nickname_index ON votes(voice, thread_id, nickname);


ALTER TABLE forumusers
ADD CONSTRAINT unique_forum_user_pair UNIQUE (forum, nickname);

CREATE INDEX IF NOT EXISTS nickname_thread_index ON votes(nickname, thread_id);

CREATE INDEX IF NOT EXISTS thread_id_index ON posts(thread, id);
