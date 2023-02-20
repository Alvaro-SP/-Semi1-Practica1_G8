package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
	"time"
	_ "github.com/go-sql-driver/mysql" // La librería que nos permite conectar a MySQL
	"github.com/gorilla/mux"
)

var db *sql.DB

// ! funcion para obtener conexion de la base de datos
func obtenerBaseDeDatos() (db *sql.DB, e error) {
	// * open the db connection.
	usuario := "myuser"
	pass := "2412"
	host := "tcp(db:3306)" // can the 127.0.0.1 ip too instead of db
	nombreBaseDeDatos := "mydb"
	// Debe tener la forma usuario:contraseña@host/nombreBaseDeDatos
	dbtemp, err := sql.Open("mysql", fmt.Sprintf("%s:%s@%s/%s", usuario, pass, host, nombreBaseDeDatos))
	if err != nil {
		fmt.Println("ERROR DE CONEXION CON LA BASE DE DATOS \n")
	}
	return dbtemp, nil
}

// ! Funcion para LOGIN
func login(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	// Parsea el cuerpo de la solicitud
    var credenciales struct {
        Usuario   string `json:"Usuario"`
        Password string `json:"Password"`
    }

    err := json.NewDecoder(r.Body).Decode(&credenciales)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
	// Si las credenciales son correctas, establece res a true
    // Si las credenciales son incorrectas, establece res a false
	res := false
    // se comprueba las credenciales con la base de datos
	// Realizar consulta a la base de datos para comprobar las credenciales
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM usuario WHERE username=? AND password=?", credenciales.Usuario, credenciales.Password).Scan(&count)
	if err != nil {
		fmt.Println("Credenciales incorrectas")
	} else if count > 0 {
		res = true
	}
    // Genera una respuesta JSON
    respuesta := struct {
        Res bool `json:"Res"`
    }{
        Res: res,
    }

    // Codifica la respuesta como JSON y la escribe en la respuesta HTTP
    w.Header().Set("Content-Type", "application/json")
    err = json.NewEncoder(w).Encode(respuesta)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
}

func main() {
	var err error
	db, err = obtenerBaseDeDatos()
	if err != nil {
		fmt.Println("Error obteniendo base de datos: %v", err)
		return
	}
	// Terminar conexión al terminar función
	defer db.Close()

	// Ahora vemos si tenemos conexión
	err = db.Ping()
	if err != nil {
		fmt.Println("Error conectando: %v", err)
		return
	}
	// Listo, aquí ya podemos usar a db!
	fmt.Println("Conectado correctamente a la base de datos")
	// ! ********** RUTAS ***********
	r := mux.NewRouter()
	r.HandleFunc("/login", login).Methods("POST")


	fmt.Println("Servidor iniciado CORRECTAMENTE")
	err = http.ListenAndServe(":8080", r)
	if err != nil {
		fmt.Println(err)
	}
}