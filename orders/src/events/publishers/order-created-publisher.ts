import { OrderCreatedEvent, Publisher, Subjects } from "@ah-tickets/common"

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}