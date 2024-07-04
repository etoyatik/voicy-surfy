import { users } from '../db.js';

export default async function saveUserToDb(ctx, next) {
  await users.updateOne({
    username: ctx.message.from.username,
    id: ctx.message.from.id,
  }, {
    $setOnInsert:
    {
      firstName: ctx.message.from.first_name,
      date: new Date().toUTCString(),
    },
  }, { upsert: true });
  next();
}
