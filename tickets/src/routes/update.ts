import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from "@ah-tickets/common";
import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket.model";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router.put("/api/tickets/:id", requireAuth, [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number")
], validateRequest, async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const { id } = req.params;
    const ticket = await Ticket.findById(id);
    if (!ticket) {
        throw new NotFoundError();
    }

    if (ticket.orderId) {
        throw new BadRequestError('Ticket is already reserved');
    }
    if (ticket.userId !== req.currentUser?.id) {
        throw new NotAuthorizedError();
    }

    ticket.title = title;
    ticket.price = price;
    await ticket.save();
    new TicketUpdatedPublisher(natsWrapper.client).publish(
        {
            id: ticket._id.toString(),
            title: ticket.title,
            price: ticket.price,
            userId: req.currentUser!.id,
            version: ticket.version
        }
    );
    res.status(200).send(ticket);
});

export { router as updateTicketRouter };
