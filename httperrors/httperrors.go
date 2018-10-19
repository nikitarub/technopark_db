package httperrors

import (
	"net/http"
	"technopark/db/technopark_db/logger"
)

const (
	BadRequest          = 400
	InternalServerError = 500
)

func BadRequestErrorHandler(err error, w http.ResponseWriter) {
	if err != nil {
		logger.LogError(err)
		w.WriteHeader(BadRequest)
		return
	}
}

func InternalServerErrorHandler(err error, w http.ResponseWriter) {
	if err != nil {
		logger.LogError(err)
		w.WriteHeader(InternalServerError)
		return
	}
}
