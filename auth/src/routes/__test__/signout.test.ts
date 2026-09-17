import request from "supertest";
import { app } from "../../app";

it("clears the cookie on signout", async () => {
  const signUpResponse = await request(app)
    .post("/api/users/sign-up")
    .send({ email: "ahsan@yopmail.com", password: "User@123" })
    .expect(201);
  expect(signUpResponse.get("Set-Cookie")).toBeDefined();
  const signOutResponse = await request(app)
    .post("/api/users/sign-out")
    .expect(200);

  const cookies = signOutResponse.get("Set-Cookie") as string[];

  expect(cookies[0]).toBe(
    "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly",
  );
});
