import {con} from './dbconnection.js'
import {deletePhoto,uploadPhoto} from './s3conn.js'

const login = async (req, res) => {
    

    const data=req.body;       
    console.log(data)
    res.jsonp({})
}






const test = async (req, res) => {
    

    const data=req.body;       
    console.log(data)
    try {
        uploadPhoto(req.body).then(async (url_photo) => {
            res.jsonp({url:url_photo})
        })        
    } catch (error) {
        res.send(error.message);
    }
    
}

export{test,login}