import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@ah-tickets/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

// jest.mock('../../stripe');

it("returns a 404 when purchasing an order that does not exists", async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({ token: "askdj", orderId: new mongoose.Types.ObjectId() })
        .expect(404);
});

it("returns a 401 when purchasing an order that does not belong to the user", async () => {
    const order = Order.build(
        {
            id: new mongoose.Types.ObjectId().toHexString(),
            userId: new mongoose.Types.ObjectId().toHexString(),
            version: 0,
            price: 20,
            status: OrderStatus.Created
        }
    );
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({ token: "askdj", orderId: order._id })
        .expect(401);

});
it("returns a 400 when purchasing a cancelled order", async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build(
        {
            id: new mongoose.Types.ObjectId().toHexString(),
            userId,
            version: 0,
            price: 20,
            status: OrderStatus.Cancelled
        }
    );
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({ token: "askdj", orderId: order._id })
        .expect(400);
});

it('returns a 204 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor((Math.random() * 1000));
    const order = Order.build(
        {
            id: new mongoose.Types.ObjectId().toHexString(),
            userId,
            version: 0,
            price,
            status: OrderStatus.Created
        }
    );
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({ token: "tok_visa", orderId: order._id })
        .expect(201);

    const { data: stripeCharges } = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.find((charge) => charge.amount === price * 100);
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    // expect(chargeOptions.amount).toEqual(order.price * 100);
    // expect(chargeOptions.source).toEqual('tok_visa');
    // expect(chargeOptions.currency).toEqual('USD');
    // expect(stripe.charges.create).toHaveBeenCalled();


    const payment = await Payment.findOne({ stripeId: stripeCharge!.id, orderId: order._id.toHexString() });
    expect(payment).not.toBeNull();
});
