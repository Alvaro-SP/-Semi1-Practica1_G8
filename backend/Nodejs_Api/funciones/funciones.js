import { con } from './dbconnection.js'
import { deletePhoto, uploadPhotoprofile, uploadPhotopic } from './s3conn.js'
import md5 from 'blueimp-md5'

const test = async (req, res) => {
    console.log(req.body)
    res.jsonp({ res: md5(req.body.texto) })

}

const login = async (req, res) => {


    const data = req.body;
    try {

        con.query(`SELECT * FROM usuario WHERE username = '${data.Usuario}' AND password = '${md5(data.Password)}' `, function (err, result, fields) {
            if (err) { res.jsonp({ Res: false }) }
            else {
                console.log(result)
                if (result.length == 1) {
                    res.jsonp({ Res: true })
                } else {
                    res.jsonp({ Res: false })
                }
            }
        });

    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}

const Registrar = async (req, res) => {
    const data = req.body;
    try {
        con.query(`SELECT * FROM usuario WHERE username = '${data.Usuario}'`, function (err, result, fields) {
            console.log(result);
            if (result.length >= 1) { res.jsonp({ Res: false }) }
            else {
                uploadPhotoprofile(req.body).then(async (url_photo) => {
                    var sql = `INSERT INTO usuario (id, username, name, password, photo)
                            VALUES (0, '${data.Usuario}','${data.Nombre}','${md5(data.Password)}','${url_photo}')`;
                    //console.log(sql)
                    con.query(sql, function (err, result2) {
                        if (err) { res.jsonp({ Res: false }) }
                        else {

                            //conseguir id del usuario


                            con.query(`SELECT * FROM usuario WHERE username = '${data.Usuario}' AND password = '${md5(data.Password)}' `, function (err, resultlogin, fields) {
                                if (err) { res.jsonp({ Res: false }) }
                                else {
                                    const iduser = resultlogin[0].id

                                    // Crear album 
                                    var sql2 = `INSERT INTO album (id, name_album, usuario_id)
                            VALUES (0, 'fotos de perfil',${iduser});`;
                                    console.log(sql2)
                                    con.query(sql2, function (err, result3) {
                                        if (err) { res.jsonp({ Res: false }) }
                                        else {

                                            //conseguir id del album                                           
                                            con.query(`SELECT * FROM album WHERE name_album = 'fotos de perfil' AND usuario_id = ${iduser}`, function (err, resultalbum, fields) {
                                                if (err) { res.jsonp({ Res: false }) }
                                                else {
                                                    //console.log(resultalbum[0].id);
                                                    const idalbum = resultalbum[0].id

                                                    // cargar nuevamente la imagen 
                                                    uploadPhotoprofile({ Usuario: req.body.Usuario + `_0`, Foto: req.body.Foto }).then(async (url_photo2) => {
                                                        //insertar la imagen a la base de datos
                                                        var queryforimage = `INSERT INTO fotos (id, name_photo, photo_link, album_id)
                                        VALUES (0, 'profilepic','${url_photo2}', ${idalbum} )`;
                                                        console.log(queryforimage)
                                                        con.query(queryforimage, function (err, result7) {
                                                            if (err) { res.jsonp({ Res: false }) }
                                                            else {
                                                                res.jsonp({ Res: true })
                                                            }
                                                        });


                                                    },
                                                        async (error) => {
                                                            console.log(error)
                                                            res.jsonp({ Res: false })
                                                        })
                                                }
                                            });
                                        }
                                    })
                                }
                            });
                        }
                    });
                })
            }
        });

    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}


const infouser = async (req, res) => {
    const data = req.params;
    try {
        var sql = `SELECT username, name, photo FROM usuario WHERE username = '${data.usuario}'`
        console.log(sql)
        con.query(sql, function (err, result, fields) {
            if (err) { res.jsonp({ Res: false }) }
            else {
                console.log(result);
                if (result.length == 1) {
                    res.jsonp({
                        Usuario: result[0].username,
                        Nombre: result[0].name,
                        Foto: result[0].photo,                        
                    })
                } else {
                    res.jsonp({ Res: false })
                }
            }
        });

    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}

const actualizaInfo = async (req, res) => {
    const data = req.body;
    const usuario = data.Usuario;
    const nombre = data.Nombre;
    const Foto = data.Foto;
    const Password = md5(data.Password);
    const username = data.Lastusuario;
    //console.log(data)
    try {
        var sql = `SELECT id, username, name, photo FROM usuario WHERE username = '${username}' AND password = '${Password}'`
        console.log(sql)
        con.query(sql, function (err, result, fields) {
            if (err) { res.jsonp({ Res: false }) }
            else {
                if (result.length == 1) {
                    const iduser = result[0].id                    
                    if (Foto != "") {
                        uploadPhotoprofile(data).then(async (url_photo) => {
                            var sql2 = `SELECT * FROM album WHERE name_album = 'fotos de perfil' AND usuario_id = ${iduser}`
                            console.log(sql2)
                            con.query(sql2, function (err, resultalbum, fields) {
                                if (resultalbum.length == 1) {
                                    const albumid = resultalbum[0].id
                                    //Verificar cuantas imagenes hay en el album
                                    var sql3 = `SELECT * FROM fotos WHERE album_id = ${albumid}`
                                    console.log(sql3)
                                    con.query(sql3, function (err, resultfotos, fields) {
                                        const cantidadfotos = resultfotos.length
                                        //subirfoto
                                        uploadPhotoprofile({ Usuario: usuario + `_${cantidadfotos}`, Foto: Foto }).then(async (url_photoc) => {
                                            var sql4 = `INSERT INTO fotos (id, name_photo, photo_link, album_id) 
                                        values( 0,'profilepic_${cantidadfotos}', '${url_photoc}', ${albumid} )`
                                            console.log(sql4)
                                            con.query(sql4, function (err, resultinsert, fields) {
                                                 //cambiar los datos del usuario
                                                var sql5 = `UPDATE usuario SET username = '${usuario}', name = '${nombre}', photo = '${url_photo}' WHERE id =  ${iduser};`
                                                console.log(sql5)
                                                con.query(sql5, function (err, resultaalter, fields) {
                                                    res.jsonp({ Res: true })
                                                })
                                            })
                                        })
                                    })
                                } else {
                                    res.jsonp({ Res: false })
                                }
                            })

                           
                        })
                    }else{

                    }
                } else {
                    res.jsonp({ Res: false })
                }
            }
        });

    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}


const uploadfoto = async (req, res) => {
    try {
        const data = req.body;
        var sql = `SELECT * FROM usuario WHERE username = '${data.Lastusuario}'`
        console.log(sql)
        con.query(sql, function (err, result, fields) {
            const iduser = result[0].id
            var sql2 = `SELECT * FROM album WHERE name_album = '${data.Album}' AND usuario_id = ${iduser}`
            console.log(sql2)
            con.query(sql2, function (err, resultalbum, fields) {
                const idalbum = resultalbum[0].id

                var sqltest = `SELECT * FROM fotos WHERE name_photo = '${data.NamePhoto}' AND album_id = ${idalbum}`       
                console.log(sqltest)         
                con.query(sqltest, function (err, resultafotos, fields) {
                    if (resultafotos.length < 1 ){                        
                        uploadPhotopic(req.body).then(async (url_photo) => {                            
                            var sqlfinal = `INSERT INTO fotos (id, name_photo, photo_link, album_id)
                            VALUES (0, '${data.NamePhoto}','${url_photo}',${idalbum})`;
                            console.log(sqlfinal)
                            con.query(sqlfinal, function (err, result2) {
                                res.jsonp({ Res: true })
                            })
                        },
                        async (error) => {
                            console.log(error)
                            res.jsonp({ Res: false })
                        })
                    }else{
                        res.jsonp({ Res: false })
                    }

                })

            })
        })

        
    } catch (error) {
        res.jsonp({ Res: false })
        return error;
    }
}


const crearAlbum = async (req, res) => {
    const data = req.body;
    try {
        var sql = `SELECT * FROM usuario WHERE username = '${data.Lastusuario}'`
        //console.log(sql)
        con.query(sql, function (err, result, fields) {
            if (err) { res.jsonp({ Res: false }) }
            else {
                const iduser = result[0].id

                var sql2 = `SELECT * FROM album WHERE name_album = '${data.Album}' AND usuario_id = ${iduser}`
                //console.log(sql2)
                con.query(sql2, function (err, resultalbum, fields) {

                    console.log(resultalbum)

                    if (resultalbum.length < 1) {
                        var sql3 = `INSERT INTO album (id, name_album, usuario_id) 
                        values( 0,'${data.Album}', ${iduser} )`
                        //console.log(sql3)
                        con.query(sql3, function (err, resultinsert, fields) {
                            if (err) { res.jsonp({ Res: false }) }
                            else {
                                res.jsonp({ Res: true })
                            }
                        })

                    } else {
                        res.jsonp({ Res: false })
                    }
                })
            }
        });

    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}


const getAlbumsUser= async (req, res) => {
    const data = req.params.usuario;
    try {
        var sql = `SELECT * FROM usuario WHERE username = '${data}'`
        console.log(sql)
        con.query(sql, function (err, result, fields) {
            if (err) { res.jsonp({ Res: false }) }
            else {
                if(result.length == 1){
                    const iduser = result[0].id

                    var sql2 = `SELECT id as Id, name_album as Nombre FROM album WHERE usuario_id = ${iduser}`
                    console.log(sql2)
                    
                    con.query(sql2, function (err, resultalbum, fields) {
                        console.log(resultalbum) 
                        res.jsonp(resultalbum)
                    })
                }else{
                    res.jsonp({ Res: false })
                }
            }
        });

    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}


const changeAlbums= async (req, res) => {
    const data = req.body;
    try {
        var sql3 = `UPDATE album SET name_album = '${data.Album}' WHERE id =  ${data.Id};`
        console.log(sql3)
        con.query(sql3, function (err, resultaalter, fields) {
            if (err) { res.jsonp({ Res: false }) }
            res.jsonp({ Res: true })
        })        
    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}


const getFotosAlbum = async (req, res) => {
    const usuario = req.params.username;
    const album = req.params.nameAlbum
    try {
        var sql = `SELECT * FROM usuario WHERE username = '${usuario}'`
        con.query(sql, function (err, result, fields) {
            if (err) { res.jsonp({ Res: false }) }
            else {
                const iduser = result[0].id

                var sql2 = `SELECT id, name_album FROM album WHERE usuario_id = ${iduser} AND name_album = '${album}'`
                con.query(sql2, function (err, resultalbum, fields) {
                    const idalbum = resultalbum[0].id
                    var sql3 = `SELECT * FROM fotos WHERE album_id = ${idalbum}`
                    con.query(sql3, function (err, resultfoto, fields) {
                        
                        const arreglofotos = []
                        for (let index = 0; index < resultfoto.length; index++) {                            
                            arreglofotos.push(resultfoto[index].photo_link)                            
                        }

                        res.jsonp({Album: arreglofotos})
                    })
                })
            }
        });

    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}


const deleteAlbum = async (req, res) => {
    const usuario = req.params.username;
    const album = req.params.nameAlbum
    try {
        var sql = `SELECT * FROM usuario WHERE username = '${usuario}'`
        con.query(sql, function (err, result, fields) {
            if (err) { res.jsonp({ Res: false }) }
            else {
                if (result.length == 1){
                    const iduser = result[0].id

                    var sql2 = `SELECT id, name_album FROM album WHERE usuario_id = ${iduser} AND name_album = '${album}'`
                    con.query(sql2, function (err, resultalbum, fields) {
                        if (resultalbum.length == 1){
                            const idalbum = resultalbum[0].id

                            // ELIMINAR LAS FOTOS
                            var sql3 = `DELETE FROM fotos WHERE album_id = ${idalbum};`
                            con.query(sql3, function (err, resultfoto, fields) {
                                //ELIMINAR EL ALBUM
                                var sql4 = `DELETE FROM album WHERE id = ${idalbum};`
                                con.query(sql4, function (err, resultfoto, fields) {                   
                                    res.jsonp({ Res: true })
                                })
                            })
                        }else{
                            res.jsonp({ Res: false }) 
                        }
                    })
                }else{
                    res.jsonp({ Res: false }) 
                }
            }
        });

    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}

const getFotosUser = async (req, res) => {
    const usuario = req.params.usuario;    
    try {
        var sql = `SELECT * FROM usuario WHERE username = '${usuario}'`
        con.query(sql, function (err, result, fields) {
            if (err) { res.jsonp({ Res: false }) }
            else {
                const iduser = result[0].id

                var sql3 = `select fotos.id, name_photo, photo_link, album_id, name_album from (fotos 
                    inner join album on album.id = fotos.album_id) 
                    where album.usuario_id = ${iduser}  
                    order by album.name_album;`
                con.query(sql3, function (err, resultalbum, fields) {
                    const listaalbumes = []
                    const listasend = []

                    for (let index = 0; index < resultalbum.length; index++) {
                        const element = resultalbum[index];
                        
                        if (!listaalbumes.includes(element.name_album)){
                            listaalbumes.push(element.name_album)
                            let array = []
                            listasend.push({Nombre:element.name_album, Fotos: array})
                        }
                    }
                    

                    

                    for (let index = 0; index < resultalbum.length; index++) {
                        const element = resultalbum[index];
                        
                        for (let rec = 0; rec < listaalbumes.length; rec++) {
                            const element2 = listaalbumes[rec];
                            
                            if(element2 === element.name_album){
                                console.log(listasend[rec])
                                listasend[rec].Fotos.push(element.photo_link)
                            }
                            
                        }
                    }
                                        
                    res.jsonp(listasend)
                })
            }
        });

    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}




export { test, login, Registrar, infouser, actualizaInfo, uploadfoto, crearAlbum, getAlbumsUser, changeAlbums, getFotosAlbum, deleteAlbum, getFotosUser}