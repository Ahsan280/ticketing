import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/orders";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/orders for post requests", async () => {
    const response = await request(app).post("/api/orders").send({});
    expect(response.status).not.toEqual(404);
});

it("returns an error if the ticket does not exist", async () => {
    const ticketId = new mongoose.Types.ObjectId();
    await request(app).post("/api/orders").set("Cookie", global.signin()).send({ ticketId }).expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
    const ticket = Ticket.build({ id: new mongoose.Types.ObjectId().toHexString(), price: 20, title: "Concert" });
    await ticket.save();
    const order = Order.build({ ticket, status: OrderStatus.Created, userId: "someId", expiresAt: new Date() });
    await order.save();
    await request(app).post("/api/orders").set("Cookie", global.signin()).send({ ticketId: ticket._id }).expect(400);
});

it("reserves a ticket", async () => {
    const ticket = Ticket.build({ id: new mongoose.Types.ObjectId().toHexString(), price: 20, title: "Concert" });
    await ticket.save();
    await request(app).post("/api/orders").set("Cookie", global.signin()).send({ ticketId: ticket._id }).expect(201);
});

it("emits an order created event", async () => {
    const ticket = Ticket.build({ id: new mongoose.Types.ObjectId().toHexString(), price: 20, title: "Concert" });
    await ticket.save();
    await request(app).post("/api/orders").set("Cookie", global.signin()).send({ ticketId: ticket._id }).expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});