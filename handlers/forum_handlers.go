package handlers

import (
	"io/ioutil"
	"log"
	"net/http"
	"technopark/db/technopark_db/httperrors"
	"technopark/db/technopark_db/logger"
	"technopark/db/technopark_db/models"

	"github.com/go-openapi/strfmt"
)

// ForumCreate - Создание форума
// method: POST
func (h Handlers) ForumCreate(w http.ResponseWriter, r *http.Request) {
	logger.LogRequest(r)
	if r.Method != "POST" {
		w.WriteHeader(405)
		return
	}
	// получение body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		httperrors.BadRequestErrorHandler(err, w)
		return
	}

	// парсинг в модель
	var forum models.Forum
	err = forum.UnmarshalBinary(body)
	if err != nil {
		httperrors.InternalServerErrorHandler(err, w)
		return
	}

	// валидация данных
	var formats strfmt.Registry
	err = forum.Validate(formats)
	if err != nil {
		httperrors.BadRequestErrorHandler(err, w)
		return
	}

	response, err := forum.MarshalBinary()
	httperrors.InternalServerErrorHandler(err, w)
	if err != nil {
		httperrors.InternalServerErrorHandler(err, w)
		return
	}

	// err = queryForum(h.DB)
	if err != nil {
		log.Println("db_err: ", err)
	}
	// хз почему, но если хочешь выставить 2хх то сначала выставлешь статус,
	// а потом пишешь ответ
	// мб потому, что Write по-умолчанию ставит 200
	w.WriteHeader(201)
	w.Write([]byte(response))

}

// ForumSlugCreate - Добавление новой ветки обсуждения на форум.
// method: POST
func (Handlers) ForumSlugCreate(w http.ResponseWriter, r *http.Request) {
	// params := mux.Vars(r)
	// name := params["slug"]
	w.Write([]byte("kek:  " + r.URL.String()))
	log.Println(r.URL)
}

// ForumSlugDetails Получение информации о форуме по его идентификаторе.
// method: GET
func (Handlers) ForumSlugDetails(w http.ResponseWriter, r *http.Request) {
	// params := mux.Vars(r)
	// name := params["slug"]
	w.Write([]byte("kek:  " + r.URL.String()))
	log.Println(r.URL)
}

// ForumSlugThreads - Получение списка ветвей обсужления данного форума.
// Ветви обсуждения выводятся отсортированные по дате создания.
func (Handlers) ForumSlugThreads(w http.ResponseWriter, r *http.Request) {
	// params := mux.Vars(r)
	// name := params["slug"]
	w.Write([]byte("kek:  " + r.URL.String()))
	log.Println(r.URL)
}

// ForumSlugUsers - Получение списка пользователей, у которых есть пост или ветка обсуждения в данном форуме.
// Пользователи выводятся отсортированные по nickname в порядке возрастания.
// Порядок сотрировки должен соответсвовать побайтовому сравнение в нижнем регистре.
func (Handlers) ForumSlugUsers(w http.ResponseWriter, r *http.Request) {
	// params := mux.Vars(r)
	// name := params["slug"]
	w.Write([]byte("kek:  " + r.URL.String()))
	log.Println(r.URL)
}
