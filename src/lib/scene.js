import { Scenes } from 'telegraf';
import axios from 'axios';
import fs from 'fs';
import events from 'events';
import createFullVideoWithAudio from './video.js';
import cleanFS from '../helpers/clearTemp.js';

const createVideoScene = new Scenes.WizardScene(
  'CREATE_VIDEO_WIZARD_SCENE',
  // eslint-disable-next-line consistent-return
  async (ctx) => {
    const url = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const voice = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFile(
      `./temp/audio/${ctx.message.from.id}.ogg`,
      voice.data,
      () => {
      },
    );
    ctx.wizard.state.videoObject = {
      audio: `./temp/audio/${ctx.message.from.id}.ogg`,
      id: ctx.message.from.id,
    };
    try {
      const videoEmitter = new events.EventEmitter();
      ctx.reply('войс я скачал, фон для видео: Subway Surfers 🏄');
      ctx.wizard.state.videoObject.type = ctx?.update?.callback_query?.data || 'sub';
      ctx.wizard.state.videoObject.videoEmitter = videoEmitter;
      createFullVideoWithAudio(ctx.wizard.state.videoObject);
      let messageId;
      let i = 0;

      const timer = setTimeout(async () => {
        const data = await ctx.reply('видео в процессе 🌿 ☘️ 🪴');
        messageId = data.message_id;
      }, 1000);

      videoEmitter.on('error', async (err) => {
        clearTimeout(timer);
        console.log(err);
        if (messageId) {
          console.log(err);
          await ctx.deleteMessage(messageId);
        }
        await ctx.reply('чето пошло не так, попробуй позже 😦\nзвиняй браток ');
        cleanFS(ctx.message.from.id);
        await ctx.scene.leave().then(() => {
          videoEmitter.removeAllListeners('progress');
          videoEmitter.removeAllListeners('error');
          videoEmitter.removeAllListeners('videoEnd');
        });
      });

      // eslint-disable-next-line consistent-return
      videoEmitter.on('progress', async () => {
        try {
          i += 1;
          if (i % 8 === 0) {
            await ctx.telegram.editMessageText(
              ctx.wizard.state.videoObject.id,
              messageId,
              undefined,
              'видео в процессе 🌿 ☘️ 🪴',
            );
          } else if (i % 6 === 0) {
            await ctx.telegram.editMessageText(
              ctx.wizard.state.videoObject.id,
              messageId,
              undefined,
              'видео в процессе 👩🏻‍🦽 👨‍👨‍👧‍👦 🪡',
            );
          } else if (i % 4 === 0) {
            await ctx.telegram.editMessageText(
              ctx.wizard.state.videoObject.id,
              messageId,
              undefined,
              'видео в процессе 🧠 👀 👾',
            );
          } else if (i % 2 === 0) {
            await ctx.telegram.editMessageText(
              ctx.wizard.state.videoObject.id,
              messageId,
              undefined,
              'видео в процессе 🤓 🐤 🌚',
            );
          }
        } catch (err) {
          console.log(err);
          ctx.reply('не надо закидывать 2 войса подряд...');
          return ctx.scene.leave();
        }

        if (i === 8) {
          i = 0;
        }
      });

      videoEmitter.on('videoEnd', async () => {
        await ctx
          .replyWithVideo({
            source: `./temp/finalVideo/${ctx.wizard.state.videoObject.id}.mp4`,
          })
          .then(async () => {
            await ctx.deleteMessage(messageId);
            cleanFS(ctx.wizard.state.videoObject);
            await ctx.scene.leave().then(() => {
              videoEmitter.removeAllListeners('progress');
              videoEmitter.removeAllListeners('error');
              videoEmitter.removeAllListeners('videoEnd');
            });
          });
      });
    } catch (err) {
      console.log(err);
      ctx.reply(
        'либо ты закинул два войса подряд, либо все сломалось. в любом случае попробуй еще раз!',
      );
      return ctx.scene.leave();
    }
  },
);

export default createVideoScene;
