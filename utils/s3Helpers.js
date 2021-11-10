import AWS from 'aws-sdk';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import createSampleFromAudioFile from './audioFileHelpers.js';

dotenv.config();

const Bucket = process.env.AWS_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_ACCESS_KEY_SECRET;

const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
});

export async function uploadFile(file) {
  // Need to make a copy or uploading and copying interfere with each other.
  fs.copyFileSync(file.path, 'fileCopy');
  const fullFileStream = fs.createReadStream(file.path);
  const copyOfFileStream = fs.createReadStream('./fileCopy');
  const mainParams = {
    Bucket,
    Key: file.filename,
    Body: fullFileStream,
    ContentType: file.mimetype,
  };
  const mainResult = await s3.upload(mainParams).promise();

  await createSampleFromAudioFile(copyOfFileStream, file.path);
  const sample = fs.readFileSync(path.resolve(`${file.path}-sample`));
  const sampleParams = {
    Bucket,
    Key: `${file.filename}-sample`,
    Body: sample,
    ContentType: file.mimetype,
  };
  await s3.upload(sampleParams).promise();

  fs.unlinkSync(`${file.path}`);
  fs.unlinkSync(`${file.path}-sample`);
  fs.unlinkSync('./fileCopy');

  return mainResult;
}

export function getFileAndAddItToResponse(originalFileName, s3Key, res) {
  res.attachment(originalFileName);
  s3.getObject({ Bucket, Key: s3Key }).createReadStream().pipe(res);
}
