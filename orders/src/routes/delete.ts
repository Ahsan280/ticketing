import { NotFoundError, OrderStatus, requireAuth } from "@ah-tickets/common";
import { Router, Request, Response } from "express";
import { Order } from "../models/orders";

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
  res.status(200).send(order);
});

export { router as deleteOrderRouter };
