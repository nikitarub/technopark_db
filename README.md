# technopark_db



## notes по сути, нужно чтобы работала api, а на чем, уже не так важно

Вот [тут](https://astaxie.gitbooks.io/build-web-application-with-golang/en/05.4.html) хорошо написано как go работает с postgres. 

# MVP1:
запустить постгру и го с созданием и наполнением бд

# MVP2: 
работа первых тестов




## notes 

стадия принятие

**запуск сервера swagger** 
```
go run main.go --scheme http
```

пока что, сервер отдает 404, а не 501...


стадия отрицание, снова пишу своё

не забудь проверку на lowercase

# Ура версия 1.0
работает user/nickname/create

теперь запуск :
`go run main.go`

при этом нужна postgresql на localhost на 5432 порту с user: docker password: docker 
`docker:docker@localhost:5432`
