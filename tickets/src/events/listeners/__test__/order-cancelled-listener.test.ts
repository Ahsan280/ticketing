import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from "@ah-tickets/common";
import { Ticket } from "../../../models/ticket.model";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    // create and save a ticket
    const ticket = Ticket.build({ price: 25, title: "Concert", userId: "1234" });
    ticket.set({ orderId });
    await ticket.save();

    // create fake data event
    const data: OrderCancelledEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket._id.toHexString(),
            version: ticket.version
        }
    };
    // @ts-ignore
    const msg: Message = { ack: jest.fn() };

    return { listener, ticket, data, msg };
}

it('updates the ticket, publishes an event and acks the message', async () => {
    const { ticket, listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket._id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});