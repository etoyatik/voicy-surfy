import { Telegraf, session, Scenes } from 'telegraf';
import createVideoScene from './lib/scene.js';
import saveToDb from './middleware/saveToDb.js';
import { mongo } from './db.js';

const bot = new Telegraf(process.env.TG_BOT_TOKEN);

bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

const { Stage } = Scenes;
const stage = new Stage([createVideoScene]);

bot.use(session());
bot.use(stage.middleware());
bot.use(saveToDb);

bot.start((ctx) => {
  ctx.reply('hi!! этот бот сделает из твоего войса видео с сабвей серфом на фоне. все, что нужно сделать — закинуть сюда свой войс. \n\nпока работает ограничение по войсам на 180 секунд, будь внимательнее! все, что будет идти после обрежется\n\np.s.!!! не закидывай несколько войсов одновременно, к такому я пока не готов.');
});

bot.on('message', (ctx) => {
  if (ctx.message.voice) {
    return ctx.scene.enter('CREATE_VIDEO_WIZARD_SCENE');
  }
  ctx.reply('пока умею только войсы');
  return ctx.scene.leave();
});

bot.launch();

process.once('SIGINT', async () => {
  await mongo.close();
  bot.stop('SIGINT');
});
process.once('SIGTERM', async () => {
  await mongo.close();
  bot.stop('SIGTERM');
});
