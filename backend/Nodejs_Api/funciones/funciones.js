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
                console.log(result[0].id);
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
        con.query(`SELECT * FROM usuario WHERE username = ${data.Usuario}`, function (err, result, fields) {
            //console.log(result);
            if (result !== undefined) { res.jsonp({ Res: false }) }
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
                                                    console.log(resultalbum[0].id);
                                                    const idalbum = resultalbum[0].id

                                                    // cargar nuevamente la imagen 
                                                    uploadPhotoprofile({ Usuario: req.body.Usuario + `_0` }).then(async (url_photo2) => {
                                                        //insertar la imagen a la base de datos
                                                        var queryforimage = `INSERT INTO fotos (id, name_photo, photo_link, album_id)
                                        VALUES (0, 'profilepic','${url_photo2}', ${idalbum} )`;
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

const uploadfoto = async (req, res) => {
    try {
        const data = req.body;
        uploadPhotopic(req.body).then(async (url_photo) => {
            res.jsonp({ url: url_photo })

            //insertar la imagen a la base de datos

        },
            async (error) => {
                console.log(error)
                res.jsonp({ Res: false })
            })
    } catch (error) {
        res.jsonp({ Res: false })
        return error;
    }
}



export { test, login, Registrar, uploadfoto }