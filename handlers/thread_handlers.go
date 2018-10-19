package handlers

import (
	"log"
	"net/http"
)

func (Handlers) ThreadSlugIDCreate(w http.ResponseWriter, r *http.Request) {
	// params := mux.Vars(r)
	// name := params["slug"]
	w.Write([]byte("kek:  " + r.URL.String()))
	log.Println(r.URL)
}

func (Handlers) ThreadSlugIDDetails(w http.ResponseWriter, r *http.Request) {
	// params := mux.Vars(r)
	// name := params["slug"]
	w.Write([]byte("kek:  " + r.URL.String()))
	log.Println(r.URL)
}

func (Handlers) ThreadSlugIDPosts(w http.ResponseWriter, r *http.Request) {
	// params := mux.Vars(r)
	// name := params["slug"]
	w.Write([]byte("kek:  " + r.URL.String()))
	log.Println(r.URL)
}

func (Handlers) ThreadSlugIDVote(w http.ResponseWriter, r *http.Request) {
	// params := mux.Vars(r)
	// name := params["slug"]
	w.Write([]byte("kek:  " + r.URL.String()))
	log.Println(r.URL)
}
