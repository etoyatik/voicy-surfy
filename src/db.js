import { MongoClient } from 'mongodb';

export const mongo = new MongoClient(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/');
try {
  mongo.connect().then((connection) => {
    console.log(connection.options.dbName); // получаем имя базы данных
  });
} catch (err) {
  console.log(err);
}

export const users = mongo.db('userdb').collection('users');
