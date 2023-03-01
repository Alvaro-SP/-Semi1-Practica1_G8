import { con } from './dbconnection.js'
import { deletePhoto, uploadPhotoprofile, uploadPhotopic } from './s3conn.js'
import md5 from 'blueimp-md5'

const test = async (req, res) => {
    console.log(req.body)
    res.jsonp({res:md5(req.body.texto)})

}

const login = async (req, res) => {


    const data = req.body;
    try {

        con.query(`SELECT * FROM usuario WHERE username = '${data.Usuario}' AND password = '${md5(data.Password)}' `, function (err, result, fields) {
            if (err) { res.jsonp({ Res: false }) }
            else {
                console.log(result);
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



export { test, login, uploadfoto }