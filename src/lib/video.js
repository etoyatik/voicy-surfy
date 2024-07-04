import { path } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(path);

const getLength = async (voiceFile) => {
  const length = await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(voiceFile, (err, metadata) => {
      resolve(metadata.format.duration);
      reject(err);
    });
  });
  if (length > 180) {
    return 180;
  }
  return length;
};

const getRandomVideo = () => {
  const videoNumber = Math.floor(Math.random() * 4);
  return videoNumber;
};

const createVideoArr = (voiceLength, type = 'sub') => {
  const videoArr = [];
  const amountOfVideos = Math.ceil(voiceLength / 60);
  for (let i = 0; i < amountOfVideos; i += 1) {
    const number = getRandomVideo();
    const chosenVideo = `./public/${type}/video${number}.mp4`;
    videoArr.push(chosenVideo);
  }
  console.log(videoArr);
  return videoArr;
};

const createFinalVideo = ({
  backgroundVideo, audio, id, voiceLength, videoEmitter,
}) => {
  ffmpeg()
    .addInput(backgroundVideo)
    .addInput(audio)
    .duration(voiceLength)
    .format('mp4')
    .outputOptions('-movflags frag_keyframe+empty_moov')
    .on('progress', () => {
      videoEmitter.emit('progress');
    })
    .on('error', (err) => {
      videoEmitter.emit('error', err);
      console.error(err);
    })
    .on('end', () => {
      videoEmitter.emit('videoEnd');
    })
    .save(`./temp/finalVideo/${id}.mp4`);
};

const createBackgroundVideo = ({
  videoArr, voiceLength, audio, id, videoEmitter,
}) => new Promise((resolve, reject) => {
  try {
    const fConfig = ffmpeg();

    for (let i = 0; i < videoArr.length; i += 1) {
      fConfig.input(videoArr[i]);
    }

    fConfig.format('mp4')
      .outputFPS(24)
      .setDuration(voiceLength)
      .outputOption('-movflags frag_keyframe+empty_moov')
      .on('progress', () => {
        videoEmitter.emit('progress');
      })
      .on('error', (err) => {
        videoEmitter.emit('error', err);
        reject(err);
      })
      .on('end', () => {
        createFinalVideo({
          backgroundVideo: `./temp/backgroundVideo/${id}.mp4`, audio, id, voiceLength, videoEmitter,
        });
      })
      .mergeToFile(`./temp/backgroundVideo/${id}.mp4`, './temp/backgroundVideo/');

    resolve();
  } catch (err) {
    reject(err);
  }
});

export default async function createFullVideoWithAudio({
  audio, id, videoEmitter,
}) {
  try {
    const voiceLength = await getLength(audio);
    const videoArr = createVideoArr(voiceLength);
    createBackgroundVideo({
      videoArr, voiceLength, audio, id, videoEmitter,
    });
  } catch (err) {
    console.error(err);
  }
}
