const AWS = require('aws-sdk');


import * as dotenv from 'dotenv'
dotenv.config()

var s3 = new AWS.S3(
    {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    }
)



const uploadPhoto = async (data) => {
    try {
        var name = `${data.person.user}-${data.person.name}.jpg`;
        let buffer = new Buffer.from(data.photo, "base64");
        var params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: name,
            Body: buffer,
            ContentType: "image/jpeg",
        };
        await s3.upload(params).promise();
        // Generate a URL for the uploaded object        
        const url = s3.getSignedUrl('getObject', params);
        console.log(`https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${name}`)
        console.log(url)
        return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${name}`;
    } catch (error) {
        return error;
    }
};

const deletePhoto = async (data) => {
    try {
        var name = `${data.person.user}-${data.person.name}.jpg`;
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



export { uploadPhoto, deletePhoto }