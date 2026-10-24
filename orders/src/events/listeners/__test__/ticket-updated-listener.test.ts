import mongoose from "mongoose"
import { Ticket, TicketDoc } from "../../../models/ticket"
import { TicketUpdatedListener } from "../ticket-updated-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedEvent } from "@ah-tickets/common"


const setup = async () => {
    // create a ticket
    const ticket = Ticket.build({ id: new mongoose.Types.ObjectId().toHexString(), price: 25, title: "Concert" });
    await ticket.save();
    const listener = new TicketUpdatedListener(natsWrapper.client);
    const data: TicketUpdatedEvent['data'] = {
        id: ticket._id.toHexString(),
        price: 50,
        title: "New Title",
        version: ticket.version + 1,
        userId: "1234"
    };
    // @ts-ignore
    const msg: Message = { ack: jest.fn() };
    return { listener, data, msg, ticket };
}
it("finds, updates and saves a ticket", async () => {
    const { ticket, listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket._id);
    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
})
it("acks the message", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})

it("does not ack the message when out of order version comes", async () => {
    const { msg, data, listener, ticket } = await setup();
    try {
        await listener.onMessage({ ...data, version: data.version + 10 }, msg);
    } catch (error) {

    }
    expect(msg.ack).not.toHaveBeenCalled();
})