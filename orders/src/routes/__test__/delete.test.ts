import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/orders";



it("marks an order as cancelled", async () => {
    // create a ticket
    const ticket = Ticket.build({ price: 20, title: "Concert" });
    await ticket.save();

    const user = global.signin();
    // make a request to create an order
    const { body: order } = await request(app).post("/api/orders").set("Cookie", user).send({ ticketId: ticket._id }).expect(201);
    // make a request to cancel the order
    const { body: updatedOrder } = await request(app).delete(`/api/orders/${order.id}`).set("Cookie", user).expect(200);
    expect(updatedOrder.status).toEqual(OrderStatus.Cancelled);
});

it.todo("emits an order cancelled event");