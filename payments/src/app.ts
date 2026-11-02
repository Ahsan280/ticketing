import express from "express";

// import { errorHandler } from "./middlewares/error-handler";
// import { NotFoudError } from "./errors/not-fount-error";
import cookieSession from "cookie-session";
import { currentUser, errorHandler, NotFoundError } from "@ah-tickets/common";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" }),
);

app.use(currentUser);


app.all("/{*any}", async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
