import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("Mongo URI must be defined");
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB !!");
    
    await natsWrapper.connect("ticketing", "asdf", "http://nats-srv:4222");
    
    natsWrapper.client.on("close", () => {
      console.log("Nats connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());


    app.listen(4001, () => {
      console.log("JWT SECRET: ", process.env.JWT_KEY);
      console.log("Tickets listening on port 4001 !! ");
    });
  } catch (err) {
    console.error(err);
  }
};

start();
