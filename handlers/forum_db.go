package handlers

// type errUserNotFound string

// func (e errUserNotFound) Error() string {
// 	return string(e)
// }

// const (
// 	UserNotFound = "404: user not found"
// )

// // queryUser ищет первого пользователя с такими же данными
// func queryForum(db *sql.DB, userData models.User) (models.User, error) {
// 	sqlStatement := `
// 		SELECT
// 			nickname,
// 			fullname,
// 			email,
// 			about
// 		FROM users
// 		WHERE nickname=$1 or email=$2
// 		LIMIT 1;`

// 	row := db.QueryRow(sqlStatement, userData.Nickname, userData.Email)
// 	var tmpUser models.User
// 	err := row.Scan(&tmpUser.Nickname, &tmpUser.Fullname, &tmpUser.Email, &tmpUser.About)
// 	if err != nil {
// 		switch err {
// 		case sql.ErrNoRows:
// 			//locally handle SQL error, abstract for caller
// 			return tmpUser, errUserNotFound(UserNotFound)
// 		default:
// 			return tmpUser, err
// 		}
// 	}

// 	return tmpUser, nil
// }
