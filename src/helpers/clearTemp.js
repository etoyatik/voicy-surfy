import fs from 'node:fs';

export default function cleanFS(id) {
  try {
    fs.unlink(`./temp/audio/${id}.ogg`, () => {
    });
    fs.unlink(`./temp/backgroundVideo/${id}.mp4`, () => {
    });
    fs.unlink(`./temp/finalVideo/${id}.mp4`, () => {
    });
  } catch (err) {
    console.error(err);
  }
}
