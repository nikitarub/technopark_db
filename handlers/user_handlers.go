package handlers

import (
	"io/ioutil"
	"log"
	"net/http"
	"technopark/db/technopark_db/httperrors"
	"technopark/db/technopark_db/logger"
	"technopark/db/technopark_db/models"

	"github.com/go-openapi/strfmt"
	"github.com/gorilla/mux"
)

// ForumCreate - Создание форума
// method: POST
func (h Handlers) UserNicknameCreate(w http.ResponseWriter, r *http.Request) {
	logger.LogRequest(r)
	if r.Method != "POST" {
		w.WriteHeader(405)
		return
	}

	params := mux.Vars(r)
	nickname := params["nickname"]

	// получение body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		httperrors.BadRequestErrorHandler(err, w)
		return
	}

	// парсинг в модель
	var user models.User
	err = user.UnmarshalBinary(body)
	if err != nil {
		httperrors.InternalServerErrorHandler(err, w)
		return
	}
	user.Nickname = nickname

	// валидация данных
	var formats strfmt.Registry
	err = user.Validate(formats)
	if err != nil {
		httperrors.BadRequestErrorHandler(err, w)
		return
	}

	var response []byte

	var tmpUser models.User

	tmpUser, err = queryUser(h.DB, user)
	if err != nil {
		if err.Error() == UserConflict {
			logger.LogError(err)
			response, err = tmpUser.MarshalBinary()
			if err != nil {
				httperrors.InternalServerErrorHandler(err, w)
				return
			}
			w.WriteHeader(409)
			w.Write([]byte(response))
			return
		}
	}

	response, err = tmpUser.MarshalBinary()
	if err != nil {
		httperrors.InternalServerErrorHandler(err, w)
		return
	}

	w.WriteHeader(201)
	w.Write([]byte(response))
}

// get & post
func (Handlers) UserNicknameProfile(w http.ResponseWriter, r *http.Request) {
	// params := mux.Vars(r)
	// name := params["slug"]
	w.Write([]byte("kek:  " + r.URL.String()))
	log.Println(r.URL)
}
