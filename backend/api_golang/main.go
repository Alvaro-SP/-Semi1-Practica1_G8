package main

import (
	// "bytes"
	"crypto/md5"
	"database/sql"
	"log"

	// "encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"

	// "io/ioutil"
	"net/http"
	// "strconv"
	// "strings"
	// "time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

var db *sql.DB

func print(a string) {
	fmt.Println(a)
}

// ! Creando Structs para la insercion de datos en la tabla
type Usuario struct {
	Usuario  string `json:"usuario"`
	Nombre   string `json:"nombre"`
	Password string `json:"password"`
	Foto     string `json:"foto"`
}

type Album struct {
	ID     int    `json:"id"`
	Nombre string `json:"Nombre"`
}

type Foto struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Link      string `json:"link"`
	AlbumID   int    `json:"album_id"`
	UsuarioID int    `json:"usuario_id"`
}

// ! funcion para obtener conexion de la base de datos
func obtenerBaseDeDatos() (db *sql.DB, e error) {
	// * open the db connection.
	usuario := "root"
	pass := "2412"
	host := "tcp(localhost:3306)" // can the 127.0.0.1 ip too instead of db
	nombreBaseDeDatos := "mydb"
	// Debe tener la forma usuario:contraseña@host/nombreBaseDeDatos
	dbtemp, err := sql.Open("mysql", fmt.Sprintf("%s:%s@%s/%s", usuario, pass, host, nombreBaseDeDatos))
	if err != nil {
		fmt.Println("ERROR DE CONEXION CON LA BASE DE DATOS")
	}
	return dbtemp, nil
}

// !		 █░░ █▀█ █▀▀ █ █▄░█
// !		 █▄▄ █▄█ █▄█ █ █░▀█
func login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	// Parsea el cuerpo de la solicitud
	var credenciales struct {
		Usuario  string `json:"Usuario"`
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
	hash := md5.Sum([]byte(credenciales.Password))
	// Convierte el resultado de md5.Sum a una cadena hexadecimal
	hexHash := hex.EncodeToString(hash[:])
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM usuario WHERE username=? AND password=?", credenciales.Usuario, hexHash).Scan(&count)
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

// !		 █▀█ █▀▀ █▀▀ █ █▀ ▀█▀ █▀█ █▀█
// !		 █▀▄ ██▄ █▄█ █ ▄█ ░█░ █▀▄ █▄█
func registro(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	var user Usuario
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	fmt.Printf("%+v\n", user)
	// cfg, err := config.LoadDefaultConfig(context.Background())
	// if err != nil {
	// 	fmt.Println(err)
	// 	json.NewEncoder(w).Encode(map[string]bool{"Res": false})
	// 	return
	// }
	// cfg.Region = "us-west-2"
	// svc := s3.NewFromConfig(cfg)

	//! Decodificar la imagen en formato Base64
	// photoBytes, err := base64.StdEncoding.DecodeString(user.Foto)
	// if err != nil {
	// 	http.Error(w, "Error al decodificar la imagen", http.StatusBadRequest)
	// 	return
	// }
	//! Crear un objeto "bytes.Reader" para leer los bytes de la imagen
	// photoReader := bytes.NewReader(photoBytes)
	filename := fmt.Sprintf("%s_%s_%s.jpg", user.Usuario, user.Nombre, "0")
	// _, err = svc.PutObject(context.Background(), &s3.PutObjectInput{
	// 	Bucket: aws.String("practica1-g8-imagenes"),
	// 	Key:    aws.String("Fotos_Perfil/" + filename),
	// 	Body:   photoReader,
	// })
	// if err != nil {
	// 	fmt.Println(err)
	// 	json.NewEncoder(w).Encode(map[string]bool{"Res": false})
	// 	return
	// }
	user.Foto = fmt.Sprintf("https://practica1-g8-imagenes.s3.amazonaws.com/Fotos_Perfil/%s", filename)

	//! Guardar el usuario en la base de datos
	db, err := sql.Open("mysql", "root:2412@tcp(localhost:3306)/mydb")
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	defer db.Close()
	//! Encriptar la contraseña utilizando MD5
	hasher := md5.New()
	hasher.Write([]byte(user.Password))
	hashedPassword := hex.EncodeToString(hasher.Sum(nil))

	//! Insertar el usuario en la tabla "usuario"
	stmt, err := db.Prepare("INSERT INTO usuario(username, name, password, photo) VALUES(?, ?, ?, ?)")
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	res, err := stmt.Exec(user.Usuario, user.Nombre, hashedPassword, user.Foto)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	userID, err := res.LastInsertId()

	//! Crear un nuevo álbum para el usuario en la tabla "album"
	stmt, err = db.Prepare("INSERT INTO album(name_album, usuario_id) VALUES(?, ?)")
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	// ! here only the first album with the first ID will name "user's album".
	res, err = stmt.Exec(fmt.Sprintf("%s's album", user.Nombre), userID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	albumID, err := res.LastInsertId()
	//! Agregar la foto que se guarda en el album del usuario
	stmt, err = db.Prepare("INSERT INTO fotos(name_photo, photo_link, album_id) VALUES(?, ?, ?)")
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	_, err = stmt.Exec(fmt.Sprintf("%s_profile", user.Usuario), user.Foto, albumID)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	// Codifica la respuesta como JSON y la escribe en la respuesta HTTP
	w.Header().Set("Content-Type", "application/json")
	fmt.Println("Datos guardados Satisfactoriamente")
	json.NewEncoder(w).Encode(map[string]bool{"Res": true})
}

// !		 █ █▄░█ █▀▀ █▀█ ▀ █░█ █▀ █▀▀ █▀█
// !		 █ █░▀█ █▀░ █▄█ ▄ █▄█ ▄█ ██▄ █▀▄

func infouser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	vars := mux.Vars(r)
	usuario := vars["usuario"]

	//! Se  Consulta a la tabla de usuarios
	row := db.QueryRow("SELECT username, name, photo FROM usuario WHERE username = ?", usuario)
	var username, name, photo string
	err := row.Scan(&username, &name, &photo)
	if err != nil {
		log.Fatal(err)
	}

	//! Se crea un objeto JSON con los datos obtenidos
	data := map[string]string{
		"Usuario": username,
		"Nombre":  name,
		"Foto":    photo,
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Fatal(err)
	}

	// Enviar el objeto JSON como respuesta
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)

}

// !		 █░█ █▀█ █▀▄ ▄▀█ ▀█▀ █▀▀
// !		 █▄█ █▀▀ █▄▀ █▀█ ░█░ ██▄
func updateinfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	var user struct {
		Usuario     string `json:"usuario"`
		Nombre      string `json:"nombre"`
		Password    string `json:"password"`
		Foto        string `json:"foto"`
		Lastusuario string `json:"lastusuario"`
	}
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	fmt.Printf("%+v\n", user)
	// ! se verifica la contrasena
	hash := md5.Sum([]byte(user.Password))
	// Convierte el resultado de md5.Sum a una cadena hexadecimal
	hexHash := hex.EncodeToString(hash[:])
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM usuario WHERE username=? AND password=?", user.Lastusuario, hexHash).Scan(&count)
	if err != nil {
		fmt.Println("Credenciales incorrectas")
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	} else if count == 0 {
		fmt.Println("Credenciales incorrectas")
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	print(hexHash)
	fmt.Printf("%d", count)
	//! Se  actualiza a la tabla de usuarios username, name, photo
	stmt, err2 := db.Prepare("UPDATE usuario SET username = ?, name = ?, photo = ? WHERE username = ?")
	if err2 != nil {
		fmt.Println(err2)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	_, err = stmt.Exec(user.Usuario, user.Nombre, user.Foto, user.Lastusuario)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}

	//! Codifica la respuesta como JSON y la escribe en la respuesta HTTP
	fmt.Println("Datos Actualizados Satisfactoriamente")
	json.NewEncoder(w).Encode(map[string]bool{"Res": true})
}

// !		█░█ █▀█ █░░ █▀█ ▄▀█ █▀▄   █▀█ █░█ █▀█ ▀█▀ █▀█
// !		█▄█ █▀▀ █▄▄ █▄█ █▀█ █▄▀   █▀▀ █▀█ █▄█ ░█░ █▄█
func uploadphoto(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	var user struct {
		Foto        string `json:"foto"`
		Album       string `json:"album"`
		Lastusuario string `json:"lastusuario"`
		NamePhoto   string `json:"namephoto"`
	}
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	fmt.Printf("%+v\n", user)

	//! Get user_id from database
	var userID string
	err = db.QueryRow("SELECT id FROM usuario WHERE username=?", user.Lastusuario).Scan(&userID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	//! Get album_id from database
	var albumID string
	err = db.QueryRow("SELECT id FROM album WHERE name_album=? AND usuario_id =?", user.Album, userID).Scan(&albumID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}

	//! Insert new photo into database
	_, err = db.Exec("INSERT INTO fotos(name_photo, photo_link, album_id) VALUES(?, ?, ?)", user.NamePhoto, "link", albumID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	//! Codifica la respuesta como JSON y la escribe en la respuesta HTTP
	fmt.Println("Foto Agregada Satisfactoriamente")
	json.NewEncoder(w).Encode(map[string]bool{"Res": true})
}

// !		█▀▀ █▀█ █▀▀ ▄▀█ ▀█▀ █▀▀   ▄▀█ █░░ █▄▄ █░█ █▀▄▀█
// !		█▄▄ █▀▄ ██▄ █▀█ ░█░ ██▄   █▀█ █▄▄ █▄█ █▄█ █░▀░█
func createalbum(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	var user struct {
		Album       string `json:"album"`
		Lastusuario string `json:"lastusuario"`
	}
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	fmt.Printf("%+v\n", user)

	//! Get user_id from database
	var userID string
	err = db.QueryRow("SELECT id FROM usuario WHERE username=?", user.Lastusuario).Scan(&userID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}

	//! Insert new aLBUM into database
	_, err = db.Exec("INSERT INTO album(name_album, usuario_id) VALUES(?, ?)", user.Album, userID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	//! Codifica la respuesta como JSON y la escribe en la respuesta HTTP
	fmt.Println("Album Agregada Satisfactoriamente")
	json.NewEncoder(w).Encode(map[string]bool{"Res": true})
}

// !		█▀▀ █▀▀ ▀█▀   ▄▀█ █░░ █▄▄ █░█ █▀▄▀█
// !		█▄█ ██▄ ░█░   █▀█ █▄▄ █▄█ █▄█ █░▀░█
func getalbum(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	vars := mux.Vars(r)
	usuario := vars["usuario"]

	// Consultar los álbumes del usuario
	rows, err := db.Query("SELECT album.id, name_album FROM album JOIN usuario ON album.usuario_id = usuario.id WHERE usuario.username = ?", usuario)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	defer rows.Close()

	// Recorrer los resultados y guardarlos en una lista de álbumes
	albums := []Album{}
	for rows.Next() {
		var id int
		var nombre string
		err := rows.Scan(&id, &nombre)
		if err != nil {
			fmt.Println(err)
			json.NewEncoder(w).Encode(map[string]bool{"Res": false})
			return
		}
		album := Album{id, nombre}
		albums = append(albums, album)
	}

	// Convertir la lista de álbumes a formato JSON y enviarla en la respuesta HTTP
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(albums)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
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
	r.HandleFunc("/registro", registro).Methods("POST")
	r.HandleFunc("/info/{usuario}", infouser).Methods("GET")
	r.HandleFunc("/actualizaInfo", updateinfo).Methods("PUT")
	r.HandleFunc("/subirFoto", uploadphoto).Methods("PUT")
	r.HandleFunc("/crearAlbum", createalbum).Methods("PUT")
	r.HandleFunc("/getAlbums/{usuario}", getalbum).Methods("GET")

	fmt.Println("Servidor iniciado CORRECTAMENTE")
	err = http.ListenAndServe(":8080", r)
	if err != nil {
		fmt.Println(err)
	}
}
