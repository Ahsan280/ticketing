import { Listener, NotFoundError, Subjects, TicketUpdatedEvent } from "@ah-tickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName: string = queueGroupName;
    async onMessage(data: TicketUpdatedEvent['data'], msg: Message): Promise<void> {
        const ticket = await Ticket.findByEvent(data);
        if (!ticket) {
            throw new NotFoundError();
        }
        ticket.set({ title: data.title, price: data.price });
        await ticket.save();
        msg.ack();
    }
}