import AWS from 'aws-sdk'
import { con } from './dbconnection.js'
import axios from 'axios'
import { uploadPhotoprofile, uploadPhotopic } from './s3conn.js'
import md5 from 'blueimp-md5'

import fs from 'fs'


const test = async(req, res) => {
    console.log(req.body)
    res.jsonp({ res: md5(req.body.texto) })

}
var rekognition = new AWS.Rekognition({
    region: 'us-east-1',
    accessKeyId: 'AKIA3YXREBXTFXXW4WX6',
    secretAccessKey: '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'
})

const login = async(req, res) => {
    const data = req.body;
    try {
        //por foto

        if (data.Foto != '') {
            con.query(`SELECT photo FROM usuario WHERE username = '${data.Usuario}' `, async function(err, result, fields) {
                if (err) { res.jsonp({ Res: false }) } else {
                    console.log(result)
                    if (result.length == 1) {
                        const r = await axios.get(result[0].photo, {
                            responseType: 'arraybuffer'
                        })
                        const params = {
                            SourceImage: {
                                Bytes: Buffer.from(r.data, 'base64')
                            },
                            TargetImage: {
                                Bytes: Buffer.from(data.Foto, 'base64')
                            },
                            SimilarityThreshold: 50,
                        }

                        rekognition.compareFaces(params, (err, data) => {
                            if (err) { res.jsonp({ Res: false }) }
                            res.jsonp({ Res: data.FaceMatches.length > 0 })
                        })
                    } else {
                        res.jsonp({ Res: false })
                    }
                }
            });


        }
        //por password
        else {
            con.query(`SELECT * FROM usuario WHERE username = '${data.Usuario}' AND password = '${md5(data.Password)}' `, function(err, result, fields) {
                if (err) { res.jsonp({ Res: false }) } else {
                    console.log(result)
                    if (result.length == 1) {
                        res.jsonp({ Res: true })
                    } else {
                        res.jsonp({ Res: false })
                    }
                }
            });
        }



    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}

const Registrar = async(req, res) => {
    const data = req.body;
    try {
        con.query(`SELECT * FROM usuario WHERE username = '${data.Usuario}'`, function(err, result, fields) {
            //console.log(result);
            if (result.length >= 1) { res.jsonp({ Res: false }) } else {
                //obtener analisis facial
                const params = {
                    Image: {
                      Bytes: Buffer.from(req.body.Foto, 'base64')
                    },
                    Attributes: ['ALL']
                };
                rekognition.detectFaces(params).promise().then(async(detections) => {
                    
                    detections.FaceDetails.forEach((i) => {
                        cadena += `edad ${i.AgeRange.Low}-${i.AgeRange.High}\t`;
                        if (i.Beard.Value) {
                          cadena += 'Barba\t';
                        }
                        if (i.Eyeglasses.Value) {
                          cadena += 'Usa lentes\t';
                        }
                        if (i.Mustache.Value) {
                          cadena += 'Bigote\t';
                        }
                        if (i.Gender.Value === 'Male') {
                          cadena += 'Hombre\t';
                        } else {
                          cadena += 'Mujer\t';
                        }
                        cadena += `${i.Emotions[0].Type}`;
                        
                      });

                    uploadPhotoprofile(req.body).then(async(url_photo) => {
                        var sql = `INSERT INTO usuario (id, username, name, password, description) VALUES (0, '${data.Usuario}','${data.Nombre}','${md5(data.Password)}','${cadena}')`;
                        //console.log(sql)
                        con.query(sql, function(err, result2) {
                            if (err) { res.jsonp({ Res: false }) } else {
                                //conseguir id del usuario
                                con.query(`SELECT * FROM usuario WHERE username = '${data.Usuario}' AND password = '${md5(data.Password)}' `, function(err, resultlogin, fields) {
                                    if (err) { res.jsonp({ Res: false }) } else {
                                        const iduser = resultlogin[0].id                                      

                                        uploadPhotoprofile({ Usuario: req.body.Usuario + `_0`, Foto: req.body.Foto }).then(async(url_photo2) => {
                                            //insertar la imagen a la base de datos
                                            var queryforimage = `INSERT INTO fotos (id, name_photo, photo_link, description, userid) VALUES (0, 'profilepic','${url_photo2}', '${cadena}', '${iduser}')`;
                                            console.log(queryforimage)
                                            con.query(queryforimage, function(err, result7) {
                                                if (err) { res.jsonp({ Res: false }) } else {
                                                    var queryforalbum = `INSERT INTO album (name_album) VALUES ('perfil_${data.Usuario}')`;
                                                    con.query(queryforalbum, function(err, result7) {
                                                        if (err) { res.jsonp({ Res: false }) } else {
                                                            
                                                            con.query(`SELECT * FROM album WHERE name_album = 'perfil_${data.Usuario}'`, function(err, resultAlb, flds) {
                                                                if (err) { res.jsonp({ Res: false }) } else {
                                                                    con.query(`SELECT * FROM fotos WHERE name_photo = '${profilepic}' AND photo_link = '${url_photo2}' AND userid = '${iduser}'`, function(err, resultft, flds) {
                                                                        if (err) { res.jsonp({ Res: false }) } else {
                                                                            con.query(`INSERT INTO album_fotos (album_id, fotos_id) VALUES ('${resultAlb.id}', ${resultft.id})`, function(err, result7) {
                                                                                if (err) { res.jsonp({ Res: false }) } else {
                                                                                    res.jsonp({ Res: true })
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });

                                                        }
                                                    });
                                                }
                                            });
                                        },
                                        async(error) => {
                                            console.log(error)
                                            res.jsonp({ Res: false })
                                        })
                                    }
                                });
                            }
                        });
                    })
                })
            }
        });

    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}


const infouser = async(req, res) => {
    const data = req.params;
    try {
        var sql = `SELECT username, name, photo FROM usuario WHERE username = '${data.usuario}'`
        console.log(sql)
        con.query(sql, function(err, result, fields) {
            if (err) { res.jsonp({ Res: false }) } else {
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

const actualizaInfo = async(req, res) => {
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
        con.query(sql, function(err, result, fields) {
            if (err) { res.jsonp({ Res: false }) } else {
                if (result.length == 1) {
                    const iduser = result[0].id
                    if (Foto != "") {
                        uploadPhotoprofile(data).then(async(url_photo) => {
                            var sql2 = `SELECT * FROM album WHERE name_album = 'fotos de perfil' AND usuario_id = ${iduser}`
                            console.log(sql2)
                            con.query(sql2, function(err, resultalbum, fields) {
                                if (resultalbum.length == 1) {
                                    const albumid = resultalbum[0].id
                                        //Verificar cuantas imagenes hay en el album
                                    var sql3 = `SELECT * FROM fotos WHERE album_id = ${albumid}`
                                    console.log(sql3)
                                    con.query(sql3, function(err, resultfotos, fields) {
                                        const cantidadfotos = resultfotos.length
                                            //subirfoto
                                        uploadPhotoprofile({ Usuario: usuario + `_${cantidadfotos}`, Foto: Foto }).then(async(url_photoc) => {
                                            var sql4 = `INSERT INTO fotos (id, name_photo, photo_link, album_id) 
                                        values( 0,'profilepic_${cantidadfotos}', '${url_photoc}', ${albumid} )`
                                            console.log(sql4)
                                            con.query(sql4, function(err, resultinsert, fields) {
                                                //cambiar los datos del usuario
                                                var sql5 = `UPDATE usuario SET username = '${usuario}', name = '${nombre}', photo = '${url_photo}' WHERE id =  ${iduser};`
                                                console.log(sql5)
                                                con.query(sql5, function(err, resultaalter, fields) {
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
                    } else {

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


const uploadfoto = async(req, res) => {
    try {
        const data = req.body;
        var sql = `SELECT * FROM usuario WHERE username = '${data.Lastusuario}'`
        con.query(sql, function(err, result, fields) {
            const iduser = result[0].id

            uploadPhotopic(req.body).then(async(url_photo) => {
                    var sqlfinal = `INSERT INTO fotos (name_photo, photo_link, description, userid)
                            VALUES (0, '${data.NamePhoto}','${url_photo}',${idalbum}, ${iduser})`;
                    con.query(sqlfinal, function(err, result2, fieldd) {
                        if (err) return res.jsonp({ Res: false })
                        rekognition.detectLabels({
                            Image: Buffer.from(data.Foto, 'base64')
                        }, (err, data) => {
                            if (err) return res.jsonp({ Res: false })
                            for (let i in data.Labels) {
                                con.query(`CALL RegistroAlbumFoto(${i.Name}, ${url_photo});`, function(err, result, filedd) {
                                    if (err) return res.jsonp({ Res: false })
                                    return res.jsonp({ Res: true })
                                })
                            }
                        })
                    })
                },
                async(error) => {
                    console.log(error)
                    res.jsonp({ Res: false })
                })
        })


    } catch (error) {
        res.jsonp({ Res: false })
        return error;
    }
}


const crearAlbum = async(req, res) => {
    const data = req.body;
    try {
        var sql = `SELECT * FROM usuario WHERE username = '${data.Lastusuario}'`
            //console.log(sql)
        con.query(sql, function(err, result, fields) {
            if (err) { res.jsonp({ Res: false }) } else {
                const iduser = result[0].id

                var sql2 = `SELECT * FROM album WHERE name_album = '${data.Album}' AND usuario_id = ${iduser}`
                    //console.log(sql2)
                con.query(sql2, function(err, resultalbum, fields) {

                    console.log(resultalbum)

                    if (resultalbum.length < 1) {
                        var sql3 = `INSERT INTO album (id, name_album, usuario_id) 
                        values( 0,'${data.Album}', ${iduser} )`
                            //console.log(sql3)
                        con.query(sql3, function(err, resultinsert, fields) {
                            if (err) { res.jsonp({ Res: false }) } else {
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


const getAlbumsUser = async(req, res) => {
    const data = req.params.usuario;
    try {
        var sql = `SELECT * FROM usuario WHERE username = '${data}'`
        console.log(sql)
        con.query(sql, function(err, result, fields) {
            if (err) { res.jsonp({ Res: false }) } else {
                if (result.length == 1) {
                    const iduser = result[0].id

                    var sql2 = `SELECT id as Id, name_album as Nombre FROM album WHERE usuario_id = ${iduser}`
                    console.log(sql2)

                    con.query(sql2, function(err, resultalbum, fields) {
                        console.log(resultalbum)
                        res.jsonp(resultalbum)
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


const changeAlbums = async(req, res) => {
    const data = req.body;
    try {
        var sql3 = `UPDATE album SET name_album = '${data.Album}' WHERE id =  ${data.Id};`
        console.log(sql3)
        con.query(sql3, function(err, resultaalter, fields) {
            if (err) { res.jsonp({ Res: false }) }
            res.jsonp({ Res: true })
        })
    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}


const getFotosAlbum = async(req, res) => {
    const usuario = req.params.username;
    const album = req.params.nameAlbum
    try {
        var sql = `SELECT * FROM usuario WHERE username = '${usuario}'`
        con.query(sql, function(err, result, fields) {
            if (err) { res.jsonp({ Res: false }) } else {
                const iduser = result[0].id

                var sql2 = `SELECT id, name_album FROM album WHERE usuario_id = ${iduser} AND name_album = '${album}'`
                con.query(sql2, function(err, resultalbum, fields) {
                    const idalbum = resultalbum[0].id
                    var sql3 = `SELECT * FROM fotos WHERE album_id = ${idalbum}`
                    con.query(sql3, function(err, resultfoto, fields) {

                        const arreglofotos = []
                        for (let index = 0; index < resultfoto.length; index++) {
                            arreglofotos.push(resultfoto[index].photo_link)
                        }

                        res.jsonp({ Album: arreglofotos })
                    })
                })
            }
        });

    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}


const deleteAlbum = async(req, res) => {
    const usuario = req.params.username;
    const album = req.params.nameAlbum
    try {
        var sql = `SELECT * FROM usuario WHERE username = '${usuario}'`
        con.query(sql, function(err, result, fields) {
            if (err) { res.jsonp({ Res: false }) } else {
                if (result.length == 1) {
                    const iduser = result[0].id

                    var sql2 = `SELECT id, name_album FROM album WHERE usuario_id = ${iduser} AND name_album = '${album}'`
                    con.query(sql2, function(err, resultalbum, fields) {
                        if (resultalbum.length == 1) {
                            const idalbum = resultalbum[0].id

                            // ELIMINAR LAS FOTOS
                            var sql3 = `DELETE FROM fotos WHERE album_id = ${idalbum};`
                            con.query(sql3, function(err, resultfoto, fields) {
                                //ELIMINAR EL ALBUM
                                var sql4 = `DELETE FROM album WHERE id = ${idalbum};`
                                con.query(sql4, function(err, resultfoto, fields) {
                                    res.jsonp({ Res: true })
                                })
                            })
                        } else {
                            res.jsonp({ Res: false })
                        }
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

const getFotosUser = async(req, res) => {
    const usuario = req.params.usuario;
    try {
        var sql = `SELECT * FROM usuario WHERE username = '${usuario}'`
        con.query(sql, function(err, result, fields) {
            if (err) { res.jsonp({ Res: false }) } else {
                const iduser = result[0].id

                var sql3 = `SELECT a.id, a.name_album, f.photo_link 
FROM fotos f JOIN album_fotos af ON f.id = af.fotos_id JOIN album a ON af.album_id = a.id
WHERE f.userid = ${iduser}
order by a.name_album;`
                console.log(sql3)
                con.query(sql3, function(err, resultalbum, fields) {
                    const listaalbumes = []
                    const listasend = []

                    for (let index = 0; index < resultalbum.length; index++) {
                        const element = resultalbum[index];

                        if (!listaalbumes.includes(element.name_album)) {
                            listaalbumes.push(element.name_album)
                            let array = []
                            listasend.push({ Nombre: element.name_album, Fotos: array })
                        }
                    }




                    for (let index = 0; index < resultalbum.length; index++) {
                        const element = resultalbum[index];

                        for (let rec = 0; rec < listaalbumes.length; rec++) {
                            const element2 = listaalbumes[rec];

                            if (element2 === element.name_album) {
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




export { test, login, Registrar, infouser, actualizaInfo, uploadfoto, crearAlbum, getAlbumsUser, changeAlbums, getFotosAlbum, deleteAlbum, getFotosUser }