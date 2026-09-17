import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";

declare global {
  var signin: () => Promise<string[]>;
}

let mongo: any;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.JWT_KEY = "my-secret";
  // process.env.NODE_ENV = "test";
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = (await mongoose.connection.db?.collections()) || [];

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = async () => {
  const email = "ahsan@yopmail.com";
  const password = "User@123";

  const response = await request(app)
    .post("/api/users/sign-up")
    .send({ email, password })
    .expect(201);
  const cookie = response.get("Set-Cookie") as string[];
  return cookie;
};
