import { NotFoundError, requireAuth } from "@ah-tickets/common";
import { Router, Request, Response } from "express";
import { Order } from "../models/orders";

const router = Router();

router.get("/api/orders/:orderId", requireAuth, async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.orderId, userId: req.currentUser!.id }).populate("ticket");

  if (!order) {
    throw new NotFoundError();
  }
  res.status(200).send(order);
});

export { router as showOrderRouter };
