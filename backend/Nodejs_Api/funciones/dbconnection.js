import mysql from'mysql'

var con = mysql.createConnection({
  host: "mydb.c0fggfyplwpz.us-east-2.rds.amazonaws.com:3306",
  user: "adming8semi",
  password: "sisalesemi",
  database: "mydb"
});

export{con}