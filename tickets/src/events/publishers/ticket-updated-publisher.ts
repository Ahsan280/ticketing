import { Publisher, Subjects, TicketUpdatedEvent } from "@ah-tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated=Subjects.TicketUpdated;
}