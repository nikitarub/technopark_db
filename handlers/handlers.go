package handlers

import (
	"database/sql"
	"net/http"
	_ "technopark/db/technopark_db/models"
)

// type Handlers interface {
// 	StatusHandler()
// 	ForumSlugDetails(w http.ResponseWriter, r *http.Request)
// }

type HandleInterface interface {
	ForumCreate(w http.ResponseWriter, r *http.Request)
	ForumSlugCreate(w http.ResponseWriter, r *http.Request)
	ForumSlugDetails(w http.ResponseWriter, r *http.Request)
	ForumSlugThreads(w http.ResponseWriter, r *http.Request)
	ForumSlugUsers(w http.ResponseWriter, r *http.Request)

	PostIDDetails(w http.ResponseWriter, r *http.Request) // get & post

	ServiceClear(w http.ResponseWriter, r *http.Request)  // post
	ServiceStatus(w http.ResponseWriter, r *http.Request) // get

	ThreadSlugIDCreate(w http.ResponseWriter, r *http.Request)
	ThreadSlugIDDetails(w http.ResponseWriter, r *http.Request) // get & post
	ThreadSlugIDPosts(w http.ResponseWriter, r *http.Request)
	ThreadSlugIDVote(w http.ResponseWriter, r *http.Request)

	UserNicknameCreate(w http.ResponseWriter, r *http.Request)
	UserNicknameProfile(w http.ResponseWriter, r *http.Request) // get & post

}

type Handlers struct {
	// TODO db
	DB *sql.DB
}
