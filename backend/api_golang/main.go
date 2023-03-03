package main

import (
	// "bytes"
	"bytes"
	"crypto/md5"
	"database/sql"
	"io"
	"log"
	"os"
	"strings"

	"github.com/rs/cors"

	// "encoding/base64"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"

	// "io/ioutil"
	"net/http"
	"strconv"

	// "strings"
	// "time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	_ "github.com/rs/cors"
)

var (
	db *sql.DB
)

type S3Client struct {
	Region string
	Sess   *session.Session
	Svc    *s3.S3
}

func exitErrorf(msg string, args ...interface{}) {
	fmt.Fprintf(os.Stderr, msg+"\n", args...)
	os.Exit(1)
}

func NewS3Client(region string) *S3Client {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region),
	})
	if err != nil {
		exitErrorf("Failed to create AWS session: %v", err)
	}

	return &S3Client{
		Region: region,
		Sess:   sess,
		Svc:    s3.New(sess),
	}
}

func (c *S3Client) ListBuckets() {
	result, err := c.Svc.ListBuckets(nil)
	if err != nil {
		exitErrorf("Failed to list buckets: %v", err)
	}

	fmt.Println("Buckets:")
	for _, b := range result.Buckets {
		fmt.Printf("* %s created on %s\n",
			aws.StringValue(b.Name), aws.TimeValue(b.CreationDate))
	}
}

func (c *S3Client) UploadFile(reader io.Reader, keyName string) error {
	//! seteamos el bucket y el nombre del archivo
	bucket := "practica1-g8-imagenes"
	uploader := s3manager.NewUploader(c.Sess)
	_, err := uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(keyName),
		Body:   reader,
	})
	if err != nil {
		return fmt.Errorf("Failed to upload file %s: %v", err)
	}

	return nil
}

// *-----------------------------------------------------------------------------------------

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
	Id     int    `json:"Id"`
	Nombre string `json:"Nombre"`
}

type Foto struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	Link      string `json:"link"`
	AlbumID   int    `json:"album_id"`
	UsuarioID int    `json:"usuario_id"`
}

// ! funcion para obtener conexion de la base de datos
func obtenerBaseDeDatos() (db *sql.DB, e error) {
	// * open the db connection.
	usuario := "adming8semi"
	pass := "sisalesemi"
	host := "mydb.c0fggfyplwpz.us-east-2.rds.amazonaws.com:3306" // replace with your RDS endpoint
	nombreBaseDeDatos := "mydb"

	dbtemp, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s)/%s", usuario, pass, host, nombreBaseDeDatos))
	if err != nil {
		fmt.Println("ERROR DE CONEXION CON LA BASE DE DATOS")
	}
	return dbtemp, nil
}

// !		 █░░ █▀█ █▀▀ █ █▄░█
// !		 █▄▄ █▄█ █▄█ █ █░▀█
func login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
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
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	var user Usuario
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	// fmt.Printf("%+v\n", user)
	// ****************************************************************
	//! Decodificar la imagen en formato Base64
	photoBytes, err := base64.StdEncoding.DecodeString(user.Foto)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	//! Crear un objeto "bytes.Reader" para leer los bytes de la imagen
	photoReader := bytes.NewReader(photoBytes)
	contador := 0
	// TODO: PARAMETROS DE KEYNAME(url) =  "Fotos_Perfil/[usuario]_id.jpg"
	keyName := fmt.Sprintf("Fotos_Perfil/%s_%s.jpg", user.Usuario, strconv.Itoa(contador))

	region := "us-east-2"
	//! create a new S3 client
	s3Client := NewS3Client(region)
	// ! Subir la imagen a S3
	err = s3Client.UploadFile(photoReader, keyName)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	// ****************************************************************
	user.Foto = fmt.Sprintf("https://practica1-g8-imagenes.s3.amazonaws.com/%s", keyName)

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
	res, err = stmt.Exec(fmt.Sprintf("%s_album", user.Usuario), userID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	albumID, err := res.LastInsertId()

	var photocontID string
	err = db.QueryRow("SELECT COUNT(*) FROM fotos WHERE album_id=?", albumID).Scan(&photocontID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	//! Agregar la foto que se guarda en el album del usuario
	stmt, err = db.Prepare("INSERT INTO fotos(name_photo, photo_link, album_id) VALUES(?, ?, ?)")
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	_, err = stmt.Exec(fmt.Sprintf("%s_%s", user.Usuario, photocontID), user.Foto, albumID)
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
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
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
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
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
	// fmt.Printf("%+v\n", user)
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
	if !strings.HasPrefix(user.Foto, "http") {
		// ****************************************************************
		//! Decodificar la imagen en formato Base64
		photoBytes, err := base64.StdEncoding.DecodeString(user.Foto)
		if err != nil {
			fmt.Println(err)
			json.NewEncoder(w).Encode(map[string]bool{"Res": false})
			return
		}

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
		err = db.QueryRow("SELECT id FROM album WHERE name_album=? AND usuario_id =?", fmt.Sprintf("%s_album", user.Lastusuario), userID).Scan(&albumID)
		if err != nil {
			fmt.Println(err)
			json.NewEncoder(w).Encode(map[string]bool{"Res": false})
			return
		}

		//! Crear un objeto "bytes.Reader" para leer los bytes de la imagen
		photoReader := bytes.NewReader(photoBytes)
		var photocontID string
		err = db.QueryRow("SELECT COUNT(*) FROM fotos WHERE album_id=?", albumID).Scan(&photocontID)
		if err != nil {
			fmt.Println(err)
			json.NewEncoder(w).Encode(map[string]bool{"Res": false})
			return
		}
		// TODO: PARAMETROS DE KEYNAME(url) =  "Fotos_Perfil/[usuario]_ID.jpg"
		keyName := fmt.Sprintf("Fotos_Perfil/%s_%s.jpg", user.Usuario, photocontID)

		region := "us-east-2"
		//! create a new S3 client
		s3Client := NewS3Client(region)
		// ! Subir la imagen a S3
		err = s3Client.UploadFile(photoReader, keyName)
		if err != nil {
			fmt.Println(err)
			json.NewEncoder(w).Encode(map[string]bool{"Res": false})
			return
		}
		// ****************************************************************
		user.Foto = fmt.Sprintf("https://practica1-g8-imagenes.s3.amazonaws.com/%s", keyName)

		//! Agregar la foto que se guarda en el album del usuario
		stmt, err := db.Prepare("INSERT INTO fotos(name_photo, photo_link, album_id) VALUES(?, ?, ?)")
		if err != nil {
			fmt.Println(err)
			json.NewEncoder(w).Encode(map[string]bool{"Res": false})
			return
		}
		_, err = stmt.Exec(fmt.Sprintf("%s_%s", user.Usuario, photocontID), user.Foto, albumID)
		if err != nil {
			json.NewEncoder(w).Encode(map[string]bool{"Res": false})
			return
		}
	}
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

	//! Se  actualiza el nombre del album con el nuevo user
	stmt, err2 = db.Prepare("UPDATE album SET name_album = ? WHERE name_album = ?")
	if err2 != nil {
		fmt.Println(err2)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	_, err = stmt.Exec(fmt.Sprintf("%s_album", user.Lastusuario), fmt.Sprintf("%s_album", user.Usuario))
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
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
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

	// ****************************************************************
	//! Decodificar la imagen en formato Base64
	photoBytes, err := base64.StdEncoding.DecodeString(user.Foto)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	//! Crear un objeto "bytes.Reader" para leer los bytes de la imagen
	photoReader := bytes.NewReader(photoBytes)

	// TODO: PARAMETROS DE KEYNAME(url) =  "Fotos_Perfil/[usuario]_[namealbum]_[namephoto].jpg"
	keyName := fmt.Sprintf("Fotos_Publicadas/%s_%s_%s.jpg", user.Lastusuario, user.Album, user.NamePhoto)

	region := "us-east-2"
	//! create a new S3 client
	s3Client := NewS3Client(region)
	// ! Subir la imagen a S3
	err = s3Client.UploadFile(photoReader, keyName)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	user.Foto = fmt.Sprintf("https://practica1-g8-imagenes.s3.amazonaws.com/%s", keyName)
	// ****************************************************************
	//! Insert new photo into database
	_, err = db.Exec("INSERT INTO fotos(name_photo, photo_link, album_id) VALUES(?, ?, ?)", user.NamePhoto, user.Foto, albumID)
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
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
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
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
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

// !			 █▀▄▀█ █▀█ █▀▄ █ █▀▀ █▄█   ▄▀█ █░░ █▄▄ █░█ █▀▄▀█
// !			 █░▀░█ █▄█ █▄▀ █ █▀░ ░█░   █▀█ █▄▄ █▄█ █▄█ █░▀░█
func modifyAlbum(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	var user struct {
		Id        string `json:"id"`
		Album     string `json:"album"`
		Lastalbum string `json:"lastalbum"`
	}
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	fmt.Printf("%+v\n", user)

	//update album set nombre_album where id=id
	//! Se  actualiza a la tabla de usuarios username, name, photo
	stmt, err2 := db.Prepare("UPDATE album SET name_album = ? WHERE id =?")
	if err2 != nil {
		fmt.Println(err2)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	_, err = stmt.Exec(user.Album, user.Id)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}

	//! Codifica la respuesta como JSON y la escribe en la respuesta HTTP
	fmt.Println("Album Actualizados Satisfactoriamente")
	json.NewEncoder(w).Encode(map[string]bool{"Res": true})
}

// !			█▀▀ █▀▀ ▀█▀   ▄▀█ █▄░█   ▄▀█ █░░ █▄▄ █░█ █▀▄▀█
// !			█▄█ ██▄ ░█░   █▀█ █░▀█   █▀█ █▄▄ █▄█ █▄█ █░▀░█
func getAlbumid(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	vars := mux.Vars(r)
	usuario := vars["username"]
	album := vars["idalbum"]

	//! Get user_id from database
	var userID string
	err := db.QueryRow("SELECT id FROM usuario WHERE username=?", usuario).Scan(&userID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	var albumID string
	err = db.QueryRow("SELECT id FROM album WHERE usuario_id=? AND name_album=?", userID, album).Scan(&albumID)

	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	//! Get photos from database
	rows, err := db.Query("SELECT name_photo, photo_link FROM fotos WHERE album_id=?", albumID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	defer rows.Close()
	//! Create a slice of photos
	photos := []map[string]string{}
	for rows.Next() {
		var name, link string
		err := rows.Scan(&name, &link)
		if err != nil {
			fmt.Println(err)
			json.NewEncoder(w).Encode(map[string]bool{"Res": false})
			return
		}
		photo := map[string]string{
			"name_photo": name,
			"photo_link": link,
		}
		photos = append(photos, photo)
	}
	// Check for errors during rows iteration
	err = rows.Err()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Create a JSON response
	response := map[string][]map[string]string{
		"Album": photos,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

}

// !			█▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   ▄▀█ █░░ █▄▄ █░█ █▀▄▀█
// !			█▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   █▀█ █▄▄ █▄█ █▄█ █░▀░█
func eliminaAlbum(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	vars := mux.Vars(r)
	usuario := vars["username"]
	album := vars["idalbum"]

	//! Get user_id from database
	var userID string
	err := db.QueryRow("SELECT id FROM usuario WHERE username=?", usuario).Scan(&userID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	var albumID string
	err = db.QueryRow("SELECT id FROM album WHERE usuario_id=? AND name_album=?", userID, album).Scan(&albumID)

	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	//! First, delete all photos related to the album being deleted
	_, err = db.Exec("DELETE FROM fotos WHERE album_id=?", albumID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	//! delete the album
	_, err = db.Exec("DELETE FROM album WHERE id=?", albumID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	//! Codifica la respuesta como JSON y la escribe en la respuesta HTTP
	fmt.Println("Album Eliminado Satisfactoriamente junto a sus fotos")
	json.NewEncoder(w).Encode(map[string]bool{"Res": true})
}

// !			█░█ █▀▀ █▀█   █▀▀ █▀█ ▀█▀ █▀█ █▀
// !			▀▄▀ ██▄ █▀▄   █▀░ █▄█ ░█░ █▄█ ▄█
func Veruserfotos(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	vars := mux.Vars(r)
	usuario := vars["usuario"]

	//! Get user_id from database
	var userID string
	err := db.QueryRow("SELECT id FROM usuario WHERE username=?", usuario).Scan(&userID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}

	//! Create a map of albums with their photos
	albums := make(map[string][]string) //* smoke this query >:v
	rows, err := db.Query("SELECT a.id, a.name_album, COALESCE(f.photo_link, '') AS photo_link FROM album a LEFT JOIN fotos f ON a.id = f.album_id WHERE a.usuario_id =?", userID)
	if err != nil {
		fmt.Println(err)
		json.NewEncoder(w).Encode(map[string]bool{"Res": false})
		return
	}
	defer rows.Close()
	for rows.Next() {
		var albumID, albumName, photoLink string
		err := rows.Scan(&albumID, &albumName, &photoLink)
		if err != nil {
			fmt.Println(err)
			json.NewEncoder(w).Encode(map[string]bool{"Res": false})
			return
		}
		if _, ok := albums[albumName]; !ok {
			albums[albumName] = []string{}
		}
		albums[albumName] = append(albums[albumName], photoLink)
	}
	err = rows.Err()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//! Create a slice of albums with their photos
	response := []map[string]interface{}{}
	for albumName, photos := range albums {
		album := map[string]interface{}{
			"Nombre": albumName,
			"Fotos":  photos,
		}
		response = append(response, album)
	}

	//! Send the JSON response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
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
	cors := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{
			http.MethodPost,
			http.MethodGet,
			http.MethodPut,
			http.MethodDelete,
		},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: false,
	})
	handler := cors.Handler(r)
	r.HandleFunc("/login", login).Methods("POST")
	r.HandleFunc("/registro", registro).Methods("POST")
	r.HandleFunc("/info/{usuario}", infouser).Methods("GET")
	r.HandleFunc("/actualizaInfo", updateinfo).Methods("PUT")
	r.HandleFunc("/subirFoto", uploadphoto).Methods("PUT")
	r.HandleFunc("/crearAlbum", createalbum).Methods("POST")
	r.HandleFunc("/getAlbums/{usuario}", getalbum).Methods("GET")
	r.HandleFunc("/modificaAlbum", modifyAlbum).Methods("PUT")
	r.HandleFunc("/getAlbum/{username}/{idalbum}", getAlbumid).Methods("GET")
	r.HandleFunc("/eliminaAlbum/{username}/{idalbum}", eliminaAlbum).Methods("DELETE")
	r.HandleFunc("/verFotos/{usuario}", Veruserfotos).Methods("GET")

	fmt.Println("Servidor iniciado CORRECTAMENTE")
	srv := http.Server{
		Addr:    ":8080",
		Handler: handler,
	}
	err = srv.ListenAndServe()
	if err != nil {
		fmt.Println(err)
	}
}
