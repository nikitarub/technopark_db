package logger

import (
	"log"
	"net/http"
)

func LogRequest(r *http.Request) {
	log.Println("url: ", r.URL, "\t method: ", r.Method)
}

func LogError(err error) {
	log.Println(err.Error())
}
