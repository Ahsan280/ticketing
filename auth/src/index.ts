import mongoose from "mongoose";
import { app } from "./app";
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
    app.listen(4000, () => {
      console.log("JWT SECRET: ", process.env.JWT_KEY);
      console.log("Auth listening on port 4000 !! ");
    });
  } catch (err) {
    console.error(err);
  }
};

start();
