package handlers

import (
	"database/sql"
	"technopark/db/technopark_db/models"
)

type errUserConflict string

func (e errUserConflict) Error() string {
	return string(e)
}

const (
	UserNotFound = "404: user not found"
	UserConflict = "409: user conflict"
)

// queryUser ищет первого пользователя с такими же данными
func queryUser(db *sql.DB, userData models.User) (models.User, error) {
	isExists, tmpUser := checkUser(db, userData)

	if isExists {
		return tmpUser, errUserConflict(UserConflict)
	}

	sqlStatement := `
	INSERT INTO users (
		nickname,
		fullname,
		email,
		about
	)
	VALUES ($1, $2, $3, $4)`
	// res, err = ... // res.RowsAffected и тд
	_, err := db.Exec(sqlStatement, userData.Nickname, userData.Fullname, userData.Email, userData.About)
	if err != nil {
		return tmpUser, err
	}
	return userData, nil
}

func checkUser(db *sql.DB, userData models.User) (bool, models.User) {
	sqlStatement := `
		SELECT
			nickname,
			fullname,
			email,
			about
		FROM users
		WHERE nickname=$1 or email=$2
		LIMIT 1;`

	row := db.QueryRow(sqlStatement, userData.Nickname, userData.Email)
	var tmpUser models.User
	err := row.Scan(&tmpUser.Nickname, &tmpUser.Fullname, &tmpUser.Email, &tmpUser.About)
	if err == sql.ErrNoRows {
		recover()
		return false, tmpUser
	}

	return true, tmpUser
}
