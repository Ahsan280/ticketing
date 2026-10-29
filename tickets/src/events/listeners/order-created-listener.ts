import { Listener, OrderCreatedEvent, Subjects } from "@ah-tickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket.model";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        console.log('Received data');
        // Find the ticket
        const ticket = await Ticket.findById(data.ticket.id);
        // if no ticket throw an error
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        // marked the ticket as reserved by setting its orderId property
        ticket.set({ orderId: data.id });
        // save the ticket
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket._id.toHexString(),
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        });

        // ack the message
        msg.ack();
    }
}