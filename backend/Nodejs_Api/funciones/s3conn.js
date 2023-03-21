import AWS from 'aws-sdk'


//import * as dotenv from 'dotenv'
//dotenv.config()

var s3 = new AWS.S3({
    accessKeyId: 'AKIA2R37HQXTCPY4WGSF',
    secretAccessKey: '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',
    region: 'us-east-2'
})



const uploadPhotoprofile = async(data) => {
    try {
        var name = `Fotos_Perfil/${data.Usuario}.jpg`;
        //console.log(data.Foto)
        let buffer = new Buffer.from(data.Foto, "base64");
        var params = {
            Bucket: 'practica1-g8-imagenes',
            Key: name,
            Body: buffer,
            ContentType: "image/jpeg",
        };
        var params2 = {
            Bucket: 'practica1-g8-imagenes',
            Key: name,
            //Body: buffer,
            //ContentType: "image/jpeg",
        };
        await s3.upload(params).promise();
        // Generate a URL for the uploaded object        
        //const url = s3.getSignedUrl('getObject', params2);
        //console.log("entra aqui")
        console.log(`https://practica1-g8-imagenes.s3.amazonaws.com/${name}`)
            //console.log(url)
        return `https://practica1-g8-imagenes.s3.amazonaws.com/${name}`;
    } catch (error) {
        console.log("error")
        return error;
    }
};


const uploadPhotopic = async(data) => {
    try {
        var name = `Fotos_Publicadas/${data.Lastusuario}_${data.Album}_${data.NamePhoto}.jpg`;
        let buffer = new Buffer.from(data.Foto, "base64");
        var params = {
            Bucket: 'practica1-g8-imagenes',
            Key: name,
            Body: buffer,
            ContentType: "image/jpeg",
        };
        var params2 = {
            Bucket: 'practica1-g8-imagenes',
            Key: name,
            //Body: buffer,
            //ContentType: "image/jpeg",
        };
        await s3.upload(params).promise();
        // Generate a URL for the uploaded object        
        const url = s3.getSignedUrl('getObject', params2);
        //console.log("entra aqui")
        //console.log(`https://${'practica1-g8-imagenes'}.s3.amazonaws.com/${name}`)
        console.log(url)
        return `https://practica1-g8-imagenes.s3.amazonaws.com/${name}`;
    } catch (error) {
        console.log("error")
        return error;
    }
};

const deletePhoto = async(data) => {
    try {
        var name = `${data.user}-${data.name}.jpg`;
        var params = {
            Bucket: 'practica1-g8-imagenes',
            Key: name,
        };
        await s3.deleteObject(params).promise();
        return "Photo deleted";
    } catch (error) {
        return error;
    }
}



export { uploadPhotoprofile, uploadPhotopic, deletePhoto }