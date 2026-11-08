import { body } from "express-validator";
import { Request, Response, Router } from "express"
import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@ah-tickets/common";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router.post("/api/payments",
    requireAuth,
    [
        body('token').not().isEmpty(), body('orderId').not().isEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser?.id) {
            throw new NotAuthorizedError();
        }

        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Order has been cancelled');
        }
        const charge = await stripe.charges.create({
            currency: "USD",
            amount: order.price * 100,
            source: token
        })
        const payment = Payment.build({ orderId, stripeId: charge.id });
        await payment.save();
        new PaymentCreatedPublisher(natsWrapper.client).publish(
            {
                id: payment._id.toHexString(),
                orderId: payment.orderId,
                stripeId: payment.stripeId
            }
        );
        res.status(201).send({ id: payment._id });
    }
);

export { router as creatChargeRouter };