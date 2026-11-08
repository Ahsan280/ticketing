import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from "@ah-tickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/orders";
import { OrderCancelledPublishser } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName: string = queueGroupName;
    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message): Promise<void> {
        // check if the order has been paid for or not
        const order = await Order.findById(data.orderId).populate('ticket');
        if (!order) {
            throw new Error("Order not found");
        }

        if (order.status === OrderStatus.Complete) {
            msg.ack();
            return;
        }
        // if not then update the order status to cancel
        order.set({ status: OrderStatus.Cancelled });
        await order.save();
        // emit an event of order cancel
        await new OrderCancelledPublishser(this.client).publish(
            {
                id: order._id.toHexString(),
                version: order.version,
                ticket: {
                    id: order.ticket._id.toHexString(),
                    version: order.ticket.version
                }
            })

        msg.ack();
        // Note: we are updating the ticket in the OrderCancelledListener in the ticket's service so the that is the answer to the below question
        // we also need to update the ticket as it is not reserved anymore. where to do that? in the order cancelled listener??

    }
}