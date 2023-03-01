import mysql from'mysql'

var con = mysql.createConnection({
  host: "mydb.c0fggfyplwpz.us-east-2.rds.amazonaws.com",
  user: "adming8semi",
  password: "sisalesemi",
  database: "mydb",
  port: "3306"
});

export{con}