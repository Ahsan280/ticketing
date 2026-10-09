import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";


it("returns a 404 if the ticket is not found", async () => {
    const doesNotExistTicketId = new mongoose.Types.ObjectId().toHexString();
    await request(app).put(`/api/tickets/${doesNotExistTicketId}`).set("Cookie", global.signin()).send({ title: "The Title", price: 25 }).expect(404);
});


it("returns a 401 if the user is not authenticated", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).put(`/api/tickets/${id}`).send({ title: "The Title", price: 25 }).expect(401);
});


it("returns a 401 if the user does not own the ticket", async () => {
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', global.signin())
        .send({ title: "The Title", price: 25 });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", global.signin())
        .send({ title: "New Title", price: 45 })
        .expect(401);
});


it("returns a 400 if the user provides an invalid title or price", async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({ title: "The Title", price: 25 });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({ title: "", price: 45 })
        .expect(400);


    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({ title: "New Title", price: -45 })
        .expect(400);


});


it("updates the ticket provided valid inputs", async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({ title: "The Title", price: 25 });

    const title = "New Title";
    const price = 45;
    const newTicketResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({ title, price })
        .expect(200);

    expect(newTicketResponse.body.title).toEqual(title);
    expect(newTicketResponse.body.price).toEqual(price);

});

it("publishes an event", async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({ title: "The Title", price: 25 });

    const title = "New Title";
    const price = 45;
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({ title, price })
        .expect(200);
        
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})