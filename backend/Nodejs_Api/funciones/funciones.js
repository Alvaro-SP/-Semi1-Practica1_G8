import AWS from 'aws-sdk'
import { con } from './dbconnection.js'
import axios from 'axios'
import { uploadPhotoprofile, uploadPhotopic } from './s3conn.js'
import md5 from 'blueimp-md5'
import { postchatbot } from './botconn.js'
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

var translate = new AWS.Translate({
    region: 'us-east-1',
    accessKeyId: 'AKIA3YXREBXTAZHZZNWQ',
    secretAccessKey: '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'
})

const login = async(req, res) => {
    const data = req.body;
    try {
        //por foto
        console.log(req.body)
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
            console.log(result);
            if (result.length >= 1) { res.jsonp({ Res: false }) } else {
                //obtener analisis facial
                const params = {
                    Image: {
                        Bytes: Buffer.from(req.body.Foto, 'base64')
                    },
                    Attributes: ['ALL']
                };

                rekognition.detectFaces(params).promise().then(async(detections) => {
                    var cadena = ''
                    detections.FaceDetails.forEach((i) => {
                        cadena += `edad ${i.AgeRange.Low}-${i.AgeRange.High}.\t`;
                        if (i.Beard.Value) {
                            cadena += 'Tiene Barba.\t';
                        }
                        if (i.Eyeglasses.Value) {
                            cadena += 'Usa lentes.\t';
                        }
                        if (i.Mustache.Value) {
                            cadena += 'Tiene Bigote.\t';
                        }
                        if (i.Gender.Value === 'Male') {
                            cadena += 'Es Hombre.\t';
                        } else {
                            cadena += 'Es Mujer.\t';
                        }

                        const params2 = {
                            SourceLanguageCode: 'auto',
                            TargetLanguageCode: 'es',
                            Text: i.Emotions[0].Type
                        }
                        translate.translateText(params2, (err2, data2) => {
                            if (err2) {
                                cadena += `${i.Emotions[0].Type}`;
                            } else {
                                cadena += `${data2.TranslatedText}`;
                            }
                        })
                    });

                    uploadPhotoprofile(req.body).then(async(url_photo) => {
                        var sql = `CALL RegistroUsuario('${data.Usuario}', '${data.Nombre}', '${md5(data.Password)}', '${cadena}', '${url_photo}')`;
                        //console.log(sql)
                        con.query(sql, function(err, result2) {
                            if (err) {
                                console.log(err);
                                res.jsonp({ Res: false })
                            } else {
                                res.jsonp({ Res: true })
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
        var sql = `SELECT username, name, photo, description FROM usuario WHERE username = '${data.usuario}'`
        console.log(sql)
        con.query(sql, function(err, result, fields) {
            if (err) { res.jsonp({ Res: false }) } else {
                console.log(result);
                if (result.length == 1) {
                    res.jsonp({
                        Usuario: result[0].username,
                        Nombre: result[0].name,
                        Foto: result[0].photo,
                        Descripcion: result[0].description
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
    console.log(Foto)
    let bandera = Foto.includes("http")
    console.log(bandera)
    try {

        con.query(`SELECT id, username, name, photo FROM usuario 
        WHERE username = '${username}'
        AND password = '${Password}'`, function(err, result, fields) {
            if (err) { console.log(err); return res.jsonp({ Res: false }) }
            console.log(result)
            if (result.length == 1) {
                const iduser = result[0].id
                    // no cambio la foto solo lo demas
                if (bandera) {
                    console.log("que onda")
                    con.query(`UPDATE usuario SET username='${usuario}', name='${nombre}',
                        password='${Password}' WHERE id=${iduser};`, function(err, resUp1, field) {
                        if (err) { console.log(err); return res.jsonp({ Res: false }) }
                        //actualizar nombre del album fotos de perfil
                        con.query(`UPDATE album SET name_album='perfil_${usuario}' 
                            WHERE name_album='perfil_${username}'`, function(err, resUp2, field) {
                            if (err) { console.log(err); return res.jsonp({ Res: false }) }
                            return res.jsonp({ Res: true })
                        })
                    })
                } else {
                    //contador de fotos de perfil
                    con.query(`SELECT COUNT(f.photo_link) as total FROM fotos f, album_fotos af, album a
                        WHERE a.name_album='perfil_${username}'
                        AND a.id=af.album_id
                        AND af.fotos_id=f.id`, function(err, resCant, field) {
                        if (err) { console.log(err); return res.jsonp({ Res: false }) }
                        const cantidad = parseInt(resCant[0].total) + 1
                        const newData = {
                            Usuario: usuario + cantidad,
                            Foto: Foto
                        }
                        const params = {
                            Image: {
                                Bytes: Buffer.from(Foto, 'base64')
                            },
                            Attributes: ['ALL']
                        };
                        rekognition.detectFaces(params).promise().then(async(detections) => {
                            var cadena = ''
                            detections.FaceDetails.forEach((i) => {
                                cadena += `edad ${i.AgeRange.Low}-${i.AgeRange.High}.\t`;
                                if (i.Beard.Value) {
                                    cadena += 'Tiene Barba.\t';
                                }
                                if (i.Eyeglasses.Value) {
                                    cadena += 'Usa lentes.\t';
                                }
                                if (i.Mustache.Value) {
                                    cadena += 'Tiene Bigote.\t';
                                }
                                if (i.Gender.Value === 'Male') {
                                    cadena += 'Es Hombre.\t';
                                } else {
                                    cadena += 'Es Mujer.\t';
                                }

                                const params2 = {
                                    SourceLanguageCode: 'auto',
                                    TargetLanguageCode: 'es',
                                    Text: i.Emotions[0].Type
                                }
                                translate.translateText(params2, (err2, data2) => {
                                    if (err2) {
                                        cadena += `${i.Emotions[0].Type}`;
                                    } else {
                                        cadena += `${data2.TranslatedText}`;
                                    }
                                })
                            });

                            uploadPhotoprofile(newData).then(async(url_photo) => {
                                //insertar foto
                                con.query(`CALL updateFoto1('${url_photo}', '${cadena}', ${iduser},'${usuario}','${username}','${nombre}');`, function(err, resUF) {
                                    if (err) { console.log(err); return res.jsonp({ Res: false }) }
                                    return res.jsonp({ Res: true })
                                })
                            })
                        })
                    })
                }



            } else {
                res.jsonp({ Res: false })
            }

        });

    } catch (err) {
        return res.jsonp({ res: false })
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
                            VALUES ('${data.NamePhoto}','${url_photo}','${data.Descripcion}', ${iduser})`;
                    con.query(sqlfinal, function(err, result2, fieldd) {
                        if (err) return res.jsonp({ Res: false })
                        const params = {
                            Image: {
                                Bytes: Buffer.from(data.Foto, 'base64')
                            }
                        }
                        rekognition.detectLabels(params, (err, data) => {
                            const labs = data.Labels
                            if (err) return res.jsonp({ Res: false })
                            for (let i = 0; i < labs.length; i++) {
                                console.log(labs[i].Name)
                                con.query(`CALL RegistroAlbumFoto('${labs[i].Name}', '${url_photo}');`, function(err, result, filedd) {
                                    if (err) {
                                        console.log(err);
                                        return res.jsonp({ Res: false })
                                    }

                                })
                            }
                            return res.jsonp({ Res: true })
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

                var sql3 = `SELECT a.id, a.name_album,f.id as idF, f.photo_link 
FROM fotos f JOIN album_fotos af ON f.id = af.fotos_id JOIN album a ON af.album_id = a.id
WHERE f.userid = ${iduser}
order by a.name_album;`
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
                                let foto = {
                                    id: element.idF,
                                    url: element.photo_link
                                }
                                listasend[rec].Fotos.push(foto)
                            }

                        }
                    }
                    return res.jsonp(listasend)
                })
            }
        });

    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}

const detalleFotoId = async(req, res) => {
    const id = req.params.id
    try {
        let consulta = `SELECT id, name_photo, photo_link, description FROM fotos WHERE id = ${id}`
        con.query(consulta, function(err, result, fields) {
            if (err) {
                console.log(err)
                return res.jsonp({ Res: false })
            }
            const salida = {
                Id: result[0].id,
                Nombre: result[0].name_photo,
                Foto: result[0].photo_link,
                Descripcion: result[0].description
            }
            return res.jsonp(salida)

        })

    } catch (err) {
        console.log(error)
        res.jsonp({ Res: false })
    }

}

const traductor = async(req, res) => {
    console.log(req.body)
    const { Idioma, Descripcion } = req.body
    const params = {
        SourceLanguageCode: 'auto',
        TargetLanguageCode: Idioma,
        Text: Descripcion
    }
    translate.translateText(params, (err, data) => {
        if (err) res.jsonp({ Res: false })
        return res.jsonp({ Traduccion: data.TranslatedText })
    })
}

const obtTxt = async(req, res) => {

    const params = {
        Image: {
            Bytes: Buffer.from(req.body.Foto, 'base64')
        }
    };
    rekognition.detectText(params, function(err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          var cadena = ""
          data.TextDetections.forEach(element => {
            cadena += element.DetectedText + "\n";
          });
          return res.jsonp({ texto: cadena })
        }
    });
}
var dict = {};

const sendmessagebot = async (req, res) => {
    const message = req.body.message;
    const id = req.body.id;
    if(dict[id] == undefined){
        dict[id] = []
        dict[id].push({
            message: message,
            bot: false
          })
    }
    console.log(message)
    try {
        //console.log("-------------")
        //console.log(postchatbot(message))

        postchatbot(message).then( (answer) => {
            console.log(answer)
            dict[id].push({
                message: answer,
                bot: true
              })
            res.jsonp(answer)
        },
        (error) => {
            console.log(error)
            res.jsonp({ Res: false })
        })
    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}



const getbotresponse = async (req, res) => {
    let iduser = req.params.id
    try {
        console.log(dict[iduser])
        res.jsonp(dict[iduser])
    } catch (error) {
        console.log(error)
        res.jsonp({ Res: false })
    }
}


export { test, login, Registrar, infouser, actualizaInfo, uploadfoto, crearAlbum, getAlbumsUser, changeAlbums, getFotosAlbum, deleteAlbum, getFotosUser, detalleFotoId, traductor, obtTxt ,sendmessagebot, getbotresponse  }