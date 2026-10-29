import { OrderCreatedEvent, OrderStatus } from "@ah-tickets/common";
import { Ticket } from "../../../models/ticket.model";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({ price: 25, title: "Concert", userId: "1234" });
    await ticket.save();

    // create fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: "12345",
        version: 0,
        expiresAt: "asd",
        ticket: {
            id: ticket._id.toHexString(),
            price: ticket.price
        }
    };
    // @ts-ignore
    const msg: Message = { ack: jest.fn() };

    return { listener, ticket, data, msg };
}

it('sets the orderId of the tickek', async () => {
    const { ticket, listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket._id);
    expect(updatedTicket!.orderId).toBeDefined();
    expect(updatedTicket!.orderId).toEqual(data.id);
});
it('acks the messsage', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
    const { ticket, listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})