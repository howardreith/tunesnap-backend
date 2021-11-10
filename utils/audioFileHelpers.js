import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const ffmpegPath = ffmpegInstaller.path;

// Will want this later
// https://stackoverflow.com/questions/52142083/how-do-i-install-ffmpeg-inside-heroku

export default async function createSampleFromAudioFile(readableStream, path) {
  return new Promise((resolve, reject) => {
    ffmpeg(readableStream)
      .setFfmpegPath(ffmpegPath)
      .toFormat('mp3')
      .setStartTime('00:00:00')
      .setDuration('30')
      .saveToFile(`${path}-sample`)
      .on('end', () => {
        resolve();
      })
      .on('error', (err) => reject(new Error(`An error occurred while creating sample audio file: ${err.message}`)));
  });
}
