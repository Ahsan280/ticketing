import { NotFoundError, OrderStatus, requireAuth } from "@ah-tickets/common";
import { Router, Request, Response } from "express";
import { Order } from "../models/orders";
import { OrderCancelledPublishser } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router.delete("/api/orders/:orderId", requireAuth, async (req: Request, res: Response) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.orderId, userId: req.currentUser!.id },
    { $set: { status: OrderStatus.Cancelled } },
    { new: true }
  );
  if (!order) {
    throw new NotFoundError();
  }
  // publish an event saying that this order was cancelled
  new OrderCancelledPublishser(natsWrapper.client).publish(
    {
      id: order._id.toString(),
      version: order.version,
      ticket: {
        id: order.ticket._id.toString(),
        version: order.ticket.version,
      }
    }
  )
  res.status(200).send(order);
});

export { router as deleteOrderRouter };
