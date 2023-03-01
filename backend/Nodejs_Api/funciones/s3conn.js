import AWS from'aws-sdk'


import * as dotenv from 'dotenv'
dotenv.config()

var s3 = new AWS.S3(
    {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    }
)



const uploadPhotoprofile = async (data) => {
    try {
        var name = `Foto_Perfil/${data.Usuario}.jpg`;
        let buffer = new Buffer.from(data.Foto, "base64");
        var params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: name,
            Body: buffer,
            ContentType: "image/jpeg",
        };        
        var params2 = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: name,
            //Body: buffer,
            //ContentType: "image/jpeg",
        };
        await s3.upload(params).promise();
        // Generate a URL for the uploaded object        
        const url = s3.getSignedUrl('getObject', params2);
        console.log("entra aqui")
        console.log(`https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${name}`)
        console.log(url)
        return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${name}`;
    } catch (error) {
        console.log("error")
        return error;
    }
};


const uploadPhotopic = async (data) => {
    try {
        var name = `Foto_Perfil/${data.Lastusuario}_${data.Album}_${data.NamePhoto}.jpg`;
        let buffer = new Buffer.from(data.Foto, "base64");
        var params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: name,
            Body: buffer,
            ContentType: "image/jpeg",
        };        
        var params2 = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: name,
            //Body: buffer,
            //ContentType: "image/jpeg",
        };
        await s3.upload(params).promise();
        // Generate a URL for the uploaded object        
        const url = s3.getSignedUrl('getObject', params2);
        console.log("entra aqui")
        console.log(`https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${name}`)
        console.log(url)
        return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${name}`;
    } catch (error) {
        console.log("error")
        return error;
    }
};

const deletePhoto = async (data) => {
    try {
        var name = `${data.user}-${data.name}.jpg`;
        var params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: name,
        };
        await s3.deleteObject(params).promise();
        return "Photo deleted";
    } catch (error) {
        return error;
    }
}



export { uploadPhotoprofile, uploadPhotopic, deletePhoto }