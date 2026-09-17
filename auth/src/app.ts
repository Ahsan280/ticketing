import express from "express";
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";
import { signoutRouter } from "./routes/signout";
// import { errorHandler } from "./middlewares/error-handler";
// import { NotFoudError } from "./errors/not-fount-error";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError } from "@ah-tickets/common";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test"  }),
);
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);
app.all("/{*any}", async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
