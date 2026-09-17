import request from "supertest";
import { app } from "../../app";
it("returns a 200 on successful signin", async () => {
  await request(app)
    .post("/api/users/sign-up")
    .send({ email: "ahsan@yopmail.com", password: "User@123" })
    .expect(201);
  await request(app)
    .post("/api/users/sign-in")
    .send({ email: "ahsan@yopmail.com", password: "User@123" })
    .expect(200);
});

it("fails when an email that does not exist is supplied", async () => {
  return request(app)
    .post("/api/users/sign-in")
    .send({ email: "ahsan@yopmail.com", password: "User@123" })
    .expect(400);
});
