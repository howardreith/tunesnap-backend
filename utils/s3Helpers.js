import AWS from 'aws-sdk';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const Bucket = process.env.AWS_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_IC;
const secretAccessKey = process.env.AWS_ACCESS_KEY_SECRET;

const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
});

export async function uploadFile(file) {
  const stream = fs.createReadStream(file.path);

  const params = {
    Bucket,
    Key: file.filename,
    Body: stream,
    ContentType: file.mimetype,
  };

  return s3.upload(params).promise();
}
