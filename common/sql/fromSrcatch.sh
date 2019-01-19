psql -h localhost -d tp -U docker -W docker -p 5432 -a -q -f common/sql/dropDB.sql
psql -h localhost -d tp -U docker -W docker -p 5432 -a -q -f common/sql/db.sql
