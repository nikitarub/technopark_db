package handlers

import (
	"log"
	"net/http"
)

// get & post
func (Handlers) PostIDDetails(w http.ResponseWriter, r *http.Request) {
	// params := mux.Vars(r)
	// name := params["slug"]
	w.Write([]byte("kek:  " + r.URL.String()))
	log.Println(r.URL)
}
