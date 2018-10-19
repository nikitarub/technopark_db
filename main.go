package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	handlers "technopark/db/technopark_db/handlers"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

const (
	PORT   = 5000
	dbhost = "localhost"
	dbport = "5432"
	dbuser = "docker"
	dbpass = "docker"
	dbname = "tp"
)

var db *sql.DB

func main() {
	initDb()
	defer db.Close()

	rtr := mux.NewRouter()

	rtr.Use(commonMiddleware)

	hnd := handlers.Handlers{db}

	rtr.HandleFunc("/forum/create", hnd.ForumCreate).Methods("POST")
	rtr.HandleFunc("/forum/{slug:[a-z-0-9]+}/create", hnd.ForumSlugCreate).Methods("POST")
	rtr.HandleFunc("/forum/{slug:[a-z-0-9]+}/details", hnd.ForumSlugDetails).Methods("GET")
	rtr.HandleFunc("/forum/{slug:[a-z-0-9]+}/threads", hnd.ForumSlugThreads).Methods("GET")
	rtr.HandleFunc("/forum/{slug:[a-z-0-9]+}/users", hnd.ForumSlugUsers).Methods("GET")

	rtr.HandleFunc("/post/{id:[0-9]+}/details", hnd.PostIDDetails).Methods("GET")
	rtr.HandleFunc("/post/{id:[0-9]+}/details", hnd.PostIDDetails).Methods("POST")

	rtr.HandleFunc("/service/clear", hnd.ServiceClear).Methods("POST")
	rtr.HandleFunc("/service/status", hnd.ServiceStatus).Methods("GET")

	rtr.HandleFunc("/thread/{slug_or_id:[a-z-0-9]+}/create", hnd.ThreadSlugIDCreate).Methods("POST")
	rtr.HandleFunc("/thread/{slug_or_id:[a-z-0-9]+}/details", hnd.ThreadSlugIDDetails).Methods("GET")
	rtr.HandleFunc("/thread/{slug_or_id:[a-z-0-9]+}/details", hnd.ThreadSlugIDDetails).Methods("POST")
	rtr.HandleFunc("/thread/{slug_or_id:[a-z-0-9]+}/posts", hnd.ThreadSlugIDPosts).Methods("GET")
	rtr.HandleFunc("/thread/{slug_or_id:[a-z-0-9]+}/vote", hnd.ThreadSlugIDVote).Methods("POST")

	rtr.HandleFunc("/user/{nickname:[a-z-0-9]+}/create", hnd.UserNicknameCreate).Methods("POST")
	rtr.HandleFunc("/user/{nickname:[a-z-0-9]+}/profile", hnd.UserNicknameProfile).Methods("GET")
	rtr.HandleFunc("/user/{nickname:[a-z-0-9]+}/profile", hnd.UserNicknameProfile).Methods("POST")

	http.Handle("/", rtr)

	log.Println("Listening on port: ", PORT)
	http.ListenAndServe(":5000", nil)
}

func initDb() {
	var err error
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s "+
		"password=%s dbname=%s sslmode=disable",
		dbhost, dbport, dbuser, dbpass, dbname)

	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	err = db.Ping()
	if err != nil {
		panic(err)
	}
	fmt.Println("Successfully connected!")
}

// TODO переместить миделварь отдельно
func commonMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}
