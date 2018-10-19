package handlers

import (
	"log"
	"net/http"
)

func (Handlers) ServiceClear(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("status: 200:  "))
	log.Println(r.URL)
}

func (Handlers) ServiceStatus(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("status: 200:  "))
	log.Println(r.URL)
}
