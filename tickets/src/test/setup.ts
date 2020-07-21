import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
    }
  }
}

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  //Build a JWT payload
  const payload = {
    id: 'noiynreioiv',
    email: 'test@test.com',
  };

  //Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //Build session Object
  const session = { jwt: token };

  //Turn session into JSON
  const sessionJSON = JSON.stringify(session);

  //Take JSON and encode it as base84
  const base64 = Buffer.from(sessionJSON).toString('base64');

  //return string thats cookie with encoded data
  return [`express:sess=${base64}`];
};
