import { requireAuth, validateRequest } from "@ah-tickets/common";
import mongoose from "mongoose";
import { body } from "express-validator";
import { Router, Request, Response } from "express";

const router = Router();

router.post("/api/orders", requireAuth, [
    body("ticketId")
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage("Ticket Id must be provided")
], validateRequest, async (req: Request, res: Response) => {
    res.status(200).send({});
});

export { router as newOrderRouter };
