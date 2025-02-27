const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
require("dotenv").config();


const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.ACCESSKEY,
        secretAccessKey: process.env.SECRETKEY,
    },
})

async function getobjecturl(key) {
    const command = new GetObjectCommand({
        Bucket: process.env.BUCKET,
        Key: key
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
}

async function putObject(filename, contentType) {
    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET,
        Key: `uploads/user-uploads/${filename}`,
        ContentType: contentType
    })
    const url = await getSignedUrl(s3Client, command);
    return url;
}

async function getobjecturlassets(key) {
    const command = new GetObjectCommand({
        Bucket: process.env.IMAGE_BUCKET,
        Key: key,
        ResponseContentDisposition:'inline',
        ResponseContentType: 'application/pdf',
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
}
async function getobjecturlimage(key) {
    const command = new GetObjectCommand({
        Bucket: process.env.IMAGE_BUCKET,
        Key: key,
        ResponseContentDisposition:'inline',
        ResponseContentType: 'image/jpg',
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
}


async function putObjectimage(filename, contentType) {
    const command = new PutObjectCommand({
        Bucket: process.env.IMAGE_BUCKET,
        Key: `images/${filename}`,
        ContentType: contentType
    })
    const url = await getSignedUrl(s3Client, command);
    return url;
}
async function putObjectresume(filename, contentType) {
    const command = new PutObjectCommand({
        Bucket: process.env.IMAGE_BUCKET,
        Key: `resume/${filename}`,
        ContentType: contentType
    })
    const url = await getSignedUrl(s3Client, command);
    return url;
}
module.exports = { getobjecturl, putObject, getobjecturlassets, putObjectimage, putObjectresume,getobjecturlimage }
