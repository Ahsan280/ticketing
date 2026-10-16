import { OrderCancelledEvent, Publisher, Subjects } from "@ah-tickets/common"

export class OrderCancelledPublishser extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}